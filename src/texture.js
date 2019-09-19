//
// Texture
// Holds the OpenGL texture data, but also
// its dimensions, so it's better for 2D
// rendering
// (c) 2019 Jani Nykänen
//


export class Texture {


    constructor(gl, img) {

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
    }


    // Bind the texture to be used in
    // rendering
    bind(gl) {

        gl.bindTexture(gl.TEXTURE_2D, this.tex);
    }

}
