import { Shader } from "./shader.js";
import { VertexNoTex, FragNoTex, VertexDefault, FragTex, FragFogAndLight } from "./shadersrc.js";
import { Mesh } from "./mesh.js";
import { Transformations } from "./transform.js";

//
// Canvas
// Not Html5 canvas (although this class
// contains is), but an "abstract" canvas
// where all the rendering happens so that
// the user does not have to know which
// rendering method is used
// (c) 2019 Jani Nykänen
//


export class Canvas extends Transformations {


    constructor(w, h) {

        super();

        this.canvas = null;
        this.gl = null;

        // Just for laziness we store them here
        this.w = w;
        this.h = h;

        this.createHtml5Canvas(w, h);
        this.initGL(this.gl);

        // Black screen by default
        this.clear(0, 0, 0);

        // Build shaders & set the default shader
        this.shaders = this.buildShaders();  
        this.activeShader = this.shaders.noTex;
        this.activeShader.use();

        this.mRect = this.createRectMesh();

        // Store previously bounded objects to
        // reduce WebGL calls
        this.boundMesh = null;
        this.boundTex = null;
    }


    // Create a rectangle mesh for
    // 2D rendering
    createRectMesh() {

        return new Mesh(
            this.gl,
            [0, 0, 0,
             1, 0, 0,
             1, 1, 0,
             0, 1, 0
            ],
            [0, 0,
             1, 0,
             1, 1,
             0, 1
            ],
            [0, 0, 1,
             0, 0, 1,
             0, 0, 1,
             0, 0, 1
            ],
            [0, 1, 2, 
             2, 3, 0
            ],
        );
    }


    // Build all the required shaders
    buildShaders() {

        let gl = this.gl;

        let shaders = [];
        shaders.noTex = new Shader(gl,
            VertexNoTex, FragNoTex);
        shaders.tex = new Shader(gl,
            VertexDefault, FragTex);
        shaders.fogAndLight = new Shader(gl,
            VertexDefault, FragFogAndLight);

        return shaders;
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
            "position: absolute; top: 0; left: 0; z-index: -1;" + 
            "image-rendering: optimizeSpeed;" + 
            "image-rendering: pixelated;" +
            "image-rendering: -moz-crisp-edges;"
            );
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

        // Find the best multiplier for
        // square pixels
        let mul = Math.min(
            (w / c.width) | 0, 
            (h / c.height) | 0);
            
        // Compute properties
        width = c.width * mul;
        height = c.height * mul;
        x = w/2 - width/2;
        y = h/2 - height/2;
        
        // Set style properties
        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";
        c.style.height = String(height | 0) + "px";
        c.style.width = String(width | 0) + "px";
        c.style.top = top;
        c.style.left = left;
    }


    // Bind a mesh, if not already bound
    bindMesh(m) {

        if (m != this.boundMesh) {

            this.boundMesh = m;
            m.bind(this.gl);
        }
    }


    // Bind a texture, if not already bound
    bindTexture(t) {

        if (t != this.boundTex) {

            this.boundTex = t;
            t.bind(this.gl);
        }
    }


    // Clear screen with a color
    clear(r, g, b) {

        let gl = this.gl;

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.clearColor(r, g, b, 1.0);
    }


    // Set global rendering color
    setColor(r, g, b, a) {

        if (r == null) {

            r = 1; g = 1; b = 1;
        }
        else if (g == null) {

            g = r; b = r;
        }

        if (a == null) a = 1.0;

        this.activeShader.setColor(
            r, g, b, a
        );
    }


    // Draw a filled rectangle
    fillRect(x, y, w, h) {

        // Set to the correct shader
        if (this.activeShader != this.shaders.noTex) {

            this.activeShader = this.shaders.noTex;
            this.activeShader.use();
        }

        this.activeShader.setVertexTransform(
            x, y, 0, w, h, 0
        );
        
        this.bindMesh(this.mRect);
        this.mRect.draw(this.gl);
    }


    // Draw a texture
    drawTexture(tex, dx, dy, dw, dh) {

        this.drawTextureRegion(tex, 0, 0, tex.w, tex.h,
            dx, dy, dw, dh);
    }


    // Draw a texture region
    drawTextureRegion(tex, sx, sy, sw, sh, dx, dy, dw, dh) {

        if (dw == null) dw = sw;
        if (dh == null) dh = sh;

        if (dw < 0) {

            dx -= dw;
        }
        if (dh < 0) {

            dy -= dh;
        }

        // Set the correct shader
        if (this.activeShader == this.shaders.noTex) {

            this.activeShader = this.shaders.tex;
            this.activeShader.use();
        }

        this.activeShader.setVertexTransform(
            dx, dy, 0, 
            dw, dh, 0);
        this.activeShader.setFragTransform(
            sx/tex.w, sy/tex.h, 
            sw/tex.w, sh/tex.h);

        this.bindMesh(this.mRect);
        this.bindTexture(tex);

        this.mRect.draw(this.gl);
    }


    // Draw text (not scaled)
    drawText(font, str, dx, dy, xoff, yoff, center) {

        let s = font.w/16;

        this.drawScaledText(
            font, str, dx, dy, xoff, yoff, s, s, center);
    }


    // Draw scaled text
    drawScaledText(font, str, dx, dy, xoff, yoff, sx, sy, center) {

        let cw = font.w / 16;
        let ch = cw;

        let x = dx;
        let y = dy;
        let c;

        // "Uniform scaling"
        let usx = sx / cw;
        let usy = sy / cw;

        if (center) {

            dx -= (str.length * (cw + xoff) * usx)/ 2.0 ;
            x = dx;
        }

        // Draw every character
        for (let i = 0; i < str.length; ++ i) {

            c = str.charCodeAt(i);
            if (c == '\n'.charCodeAt(0)) {

                x = dx;
                y += (ch + yoff) * usy;
                continue;
            }

            // Draw current character
            this.drawTextureRegion(
                font, 
                (c % 16) * cw, ((c/16)|0) * ch,
                cw, ch, x, y, sx, sy
            );

            x += (cw + xoff) * usx;
        }
    }


    // Toggle depth test
    toggleDepthTest(state) {

        if (state)
            this.gl.enable(this.gl.DEPTH_TEST);
        else
            this.gl.disable(this.gl.DEPTH_TEST);
    }
}
