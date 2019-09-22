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


    // Compute a surface normal
    computeSurfaceNormal(data, i) {

        let v1 = glMatrix.vec3.fromValues(
            data[i+3] - data[i], 
            data[i+4] - data[i+1], 
            data[i+5] - data[i+2]
        );
        glMatrix.vec3.normalize(v1, v1);

        let v2 = glMatrix.vec3.fromValues(
            data[i+6] - data[i], 
            data[i+7] - data[i+1], 
            data[i+8] - data[i+2]
        );
        glMatrix.vec3.normalize(v2, v2);

        let n = glMatrix.vec3.create();
        glMatrix.vec3.cross(n, v1, v2);

        return [-n[0], -n[1], -n[2]];
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

        let n1, n2;

        for (let y = 0; y < this.h-1; ++ y) {

            for (let x = 0; x < this.w-1; ++ x) {

                // Compute vertices (upper and lower triangle)
                vertices.push(
                    stepx * x, this.getHeightValue(x, y), stepy * y,
                    stepx * (x+1), this.getHeightValue(x+1, y), stepy * y,
                    stepx * (x+1), this.getHeightValue(x+1, y+1), stepy * (y+1),

                    stepx * (x+1), this.getHeightValue(x+1, y+1), stepy * (y+1),
                    stepx * x, this.getHeightValue(x, y+1), stepy * (y+1),
                    stepx * x, this.getHeightValue(x, y), stepy * y
                );

                // Compute UV cordinates
                uvs.push(

                    0, 0, 
                    1, 0,
                    1, 1,

                    1, 1,
                    0, 1,
                    0, 0
                );

                // Compute normals
                n1 = this.computeSurfaceNormal(vertices, vertices.length-18);
                n2 = this.computeSurfaceNormal(vertices, vertices.length - 9);
                normals.push(

                    ...n1,
                    ...n1,
                    ...n1,

                    ...n2,
                    ...n2,
                    ...n2,
                );
            }
        }


        // Compute indices
        for (let i = 0; i < vertices.length/3; ++ i) {

            indices.push(indices.length);
        }

        // Create a mesh
        return new Mesh(gl, 
            vertices, uvs, normals, indices);
    }
}
