import { Texture } from "./texture.js";

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


    // Add textures to be loaded
    addTextures() {

        for (let a of arguments) {

            this.loadTexture(a.src, a.name);
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
