//
// Texture
// Holds the OpenGL texture data, but also
// its dimensions, so it's better for 2D
// rendering
// (c) 2019 Jani Nykänen
//


export class Texture {


    constructor(gl, img, preserve) {

        this.tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
    
        // TODO: Check if compatible for
        // mipmaps?

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
        gl.texImage2D(gl.TEXTURE_2D, 
            0, gl.RGBA, gl.RGBA, 
            gl.UNSIGNED_BYTE, img);

        this.w = img.width;
        this.h = img.height;

        // Store source, if required
        this.pixels = null;
        if (preserve) {

            this.pixels = this.readPixels(img);
        }
    }


    // Read the pixel data from the src
    readPixels(img) {
        
        // Create a temporal canvas
        let cn = document.createElement("canvas");
        cn.width = img.width;
        cn.height = img.height;
        let c = cn.getContext("2d");

        c.drawImage(img, 0, 0);
        let pdata = c.getImageData(0, 0, img.width, img.height);
        let pixels = new Uint8Array(pdata.data.length);
        for (let i = 0; i < pdata.data.length; ++ i) {

            pixels[i] = pdata.data[i];
        }

        cn.remove();

        return pixels;
    }


    // Bind the texture to be used in
    // rendering
    bind(gl) {

        gl.bindTexture(gl.TEXTURE_2D, this.tex);
    }

}
