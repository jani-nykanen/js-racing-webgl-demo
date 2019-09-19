//
// Canvas
// Not Html5 canvas (although this class
// contains is), but an "abstract" canvas
// where all the rendering happens so that
// the user does not have to know which
// rendering method is used
// (c) 2019 Jani Nykänen
//


export class Canvas {


    constructor(w, h) {

        this.canvas = null;
        this.gl = null;

        // Just for laziness we store them here
        this.w = w;
        this.h = h;

        this.createHtml5Canvas(w, h);
        this.initGL(this.gl);

        // Black screen by default
        this.clear(0, 0, 0);
    }


    // Create the Html5 canvas (and div where
    // it's embedded)
    createHtml5Canvas(w, h) {

        let cdiv = document.createElement("div");
        cdiv.setAttribute("style", 
            "position: absolute; top: 0; left: 0; z-index: -1");

        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;

        this.canvas.setAttribute(
            "style", 
            "position: absolute; top: 0; left: 0; z-index: -1");
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);

        // Set the proper size (style-wise)
        this.resize(window.innerWidth, window.innerHeight);

        // Get OpenGL context
        // (We disable antialias to make it look more
        // pixelated!)
        this.gl = this.canvas.getContext("webgl", 
            {alpha:false, antialias: false});
    }


    // Initialize some basic OpenGL properties
    initGL(gl) {

        // Set OpenGL settings
        gl.activeTexture(gl.TEXTURE0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, 
            gl.ONE_MINUS_SRC_ALPHA, gl.ONE, 
            gl.ONE_MINUS_SRC_ALPHA);

        // Enable attribute arrays
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);

        // We do not need to recompute this ever
        gl.viewport(0, 0, this.w, this.h);
    }


    // Called when the window is resized (and in the creation)
    resize(w, h) {

        let c = this.canvas;
        let x, y;
        let width, height;
        let mul;

        if(this.scaleHeight) {   
            
            // Preserve vertical viewport
            if(w/h >= this.w / this.h) {

                c.width = this.cw;
                c.height = this.ch;

                width = h / this.ch * this.cw;
                height = h;

                x = w/2 - width/2;
                y = 0;
            }
            // Scale height
            else {

                x = 0;
                y = 0;
                width = w;
                height = h;

                c.width = this.cw;
                c.height = c.width/w * h;
            }
        }
        else {

            // Find the best multiplier for
            // square pixels
            mul = Math.min(
                (w / c.width) | 0, 
                (h / c.height) | 0);
            
            // Compute properties
            width = c.width * mul;
            height = c.height * mul;
            x = w/2 - width/2;
            y = h/2 - height/2;

        }
        
        // Set style properties
        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";
        c.style.height = String(height | 0) + "px";
        c.style.width = String(width | 0) + "px";
        c.style.top = top;
        c.style.left = left;
    }


    // Clear screen with a color
    clear(r, g, b) {

        let gl = this.gl;

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.clearColor(r, g, b, 1.0);
    }
}
