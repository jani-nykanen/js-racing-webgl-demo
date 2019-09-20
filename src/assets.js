import { Texture } from "./texture.js";
import { Mesh } from "./mesh.js";

//
// An asset loader/manager
// (c) 2019 Jani Nykänen
//


export class AssetLoader {


    constructor(gl) {

        this.total = 0;
        this.loaded = 0;

        // Assets
        this.textures = [];
        this.meshes = [];
        this.sounds = [];

        this.gl = gl;
    }


    // Start loading a texture
    loadTexture(src, name) {

        ++ this.total;

        let image = new Image();
        image.onload = () => {

            this.textures[name] = new Texture(this.gl, image);
            ++ this.loaded;
        }
        image.src = src;
    }


    // Load a textg document
    loadDocument(src, cb) {

        ++ this.total;

        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("text/xml");
        xobj.open("GET", src, true);

        // When loaded
        xobj.onreadystatechange = () => {

            if (xobj.readyState == 4 ) {

                if(String(xobj.status) == "200") {
                    
                    cb(xobj.responseText);
                }
                ++ this.loaded;
            }
                
        };
        xobj.send(null);  
    }


    // Load a mesh
    loadMesh(src, name) {

        this.loadDocument(src,
            (str) => {

            let rawMesh = new OBJ.Mesh(str);
            // Create a mesh
            this.meshes[name] = new Mesh(
                this.gl,
                new Float32Array(rawMesh.vertices),
                new Float32Array(rawMesh.textures),
                new Float32Array(rawMesh.vertexNormals),
                new Uint16Array(rawMesh.indices)
            );
        })
    }


    // Add textures to be loaded
    addTextures() {

        for (let a of arguments) {

            this.loadTexture(a.src, a.name);
        }
    }


    // Add meshes to be loaded
    addMeshes() {

        for (let a of arguments) {

            this.loadMesh(a.src, a.name);
        }
    }


    // Check if all the assets have been loaded
    // (in the case there were in the first place)
    hasLoaded() {

        return this.total == 0 ||
            (this.total == this.loaded);
    }


    // Get the ratio of loaded assets
    // out of assets to be loaded, in
    // scale [0, 1]
    getLoadRatio() {

        return (this.total == 0 ? 1 : this.loaded/this.total);
    }

}
