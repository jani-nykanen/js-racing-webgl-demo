import { negMod } from "./util.js";
import { Mesh } from "./mesh.js";

//
// Represent a surface of form
// S = { (x,y,z) | y = f(x, z) }.
// Generated from a heightmap.
// (c) 2019 Jani Nykänen
// 


export class Surface {


    constructor(tex, c) {

        this.w = tex.w;
        this.h = tex.h;
    
        if (tex.pixels == null) {

            throw "Texture has no pixel data," +
                "construct a surface!";
        }

        this.hmap = this.genHeightmap(tex.pixels);
        this.mesh = this.genMesh(c.gl);
    }


    // Get a value in the heightmap
    getHeightValue(x, y) {

        x = negMod(x, this.w);
        y = negMod(y, this.h);

        return this.hmap[y * this.w + x];
    }


    // Generate a heightmap from the data
    // (values scaled to range [0, 1])
    genHeightmap(data) {

        let hmap = new Float32Array(this.w*this.h);

        let i;
        let v;
        for (let y = 0; y < this.h; ++ y) {

            for (let x = 0; x < this.w; ++ x) {

                i = y * this.w * 4 + x * 4;
                // Take the mean of all the color channels,
                // then scale to [0, 1]
                v = ((data[i] + data[i+1] + data[i+2])/3.0) / 255.0;
                hmap[y * this.w + x] = v;
            }
        }

        return hmap;
    }


    // Computes a surface normal for the given coordinate
    computeSurfaceNormal(data, x, y) {

        let v1, v2, v3, v4;
        let n1, n2, n3;

        let i = y*this.w + x;
        let j = y*this.w + x + 1;
        let k = (y+1)*this.w + x + 1;
        let l = (y+1)*this.w + x;

        let ox, oy, oz;

        // Compute two different normals and
        // take their mean, which is a sufficient
        // approximation for the surface normals

        ox = data[i*3];
        oy = data[i*3 + 1];
        oz = data[i*3 + 2];

        v1 = glMatrix.vec3.fromValues(
            data[j*3] - ox, 
            data[j*3 + 1] - oy, 
            data[j*3 + 2] - oz
        );
        glMatrix.vec3.normalize(v1, v1);

        v2 = glMatrix.vec3.fromValues(
            data[k*3] - ox, 
            data[k*3 + 1] - oy, 
            data[k*3 + 2] - oz
        );
        glMatrix.vec3.normalize(v2, v2);

        ox = data[l*3];
        oy = data[l*3 + 1];
        oz = data[l*3 + 2];

        v3 = glMatrix.vec3.fromValues(
            data[j*3] - ox, 
            data[j*3 + 1] - oy, 
            data[j*3 + 2] - oz
        );
        glMatrix.vec3.normalize(v3, v3);

        v4 = glMatrix.vec3.fromValues(
            data[k*3] - ox, 
            data[k*3 + 1] - oy, 
            data[k*3 + 2] - oz
        );
        glMatrix.vec3.normalize(v4, v4);

        // Compute the normals using the cross
        // product
        n1 = glMatrix.vec3.create();
        glMatrix.vec3.cross(n1, v1, v2);

        n2 = glMatrix.vec3.create();
        glMatrix.vec3.cross(n2, v3, v4);

        // Compute the mean vector. We can safely
        // assume that this is not 0
        n3 = glMatrix.vec3.fromValues(
            -0.5 * (n1[0]+n2[0]),
            -0.5 * (n1[1]+n2[1]),
            -0.5 * (n1[2]+n2[2]),
        );
        glMatrix.vec3.normalize(n3, n3);

        return n3;
    }


    // Generate a mesh using the generated
    // heightmap data
    genMesh(gl) {

        let stepx = 1.0 / this.w;
        let stepy = 1.0 / this.h;

        let vertices = new Array();
        let uvs = new Array();
        let normals = new Array();
        let indices = new Array();

        let n;

        // Set vertices
        for (let y = 0; y < this.h; ++ y) {

            for (let x = 0; x < this.w; ++ x) {

                vertices.push(
                    stepx * x,
                    this.getHeightValue(x, y), 
                    stepy * y);

                uvs.push(x, y);
            }
        }

        
        // Compute indices
        for (let y = 0; y < this.h-1; ++ y) {

            for (let x = 0; x < this.w-1; ++ x) {

                indices.push(   

                    y * this.w + x,
                    y * this.w + x + 1,
                    (y+1) * this.w + x + 1,

                    (y+1) * this.w + x + 1,
                    (y+1) * this.w + x,
                    y * this.w + x,
                );
            }
        }

        // Compute normals
        // (has to be computed after the vertices)
        for (let y = 0; y < this.h; ++ y) {

            for (let x = 0; x < this.w; ++ x) {

                if (x == this.w-1 && y == this.h-1) {

                    normals.push(
                        normals[((y-1)*this.w+x-1)*3],
                        normals[((y-1)*this.w+x-1)*3 +1],
                        normals[((y-1)*this.w+x-1)*3 +2]
                    );
                }
                if (x == this.w-1) {

                    normals.push(
                        normals[(y*this.w+x-1)*3],
                        normals[(y*this.w+x-1)*3 +1],
                        normals[(y*this.w+x-1)*3 +2]
                        );
                }
                else if(y == this.h-1) {

                    normals.push(
                        normals[((y-1)*this.w+x)*3],
                        normals[((y-1)*this.w+x)*3 +1],
                        normals[((y-1)*this.w+x)*3 +2]
                        );
                }
                else {

                    n = this.computeSurfaceNormal(vertices, x, y);
                    normals.push(...n);
                }
            }
        }

        // Create a mesh
        return new Mesh(gl, 
            vertices, uvs, normals, indices);
    }
}
