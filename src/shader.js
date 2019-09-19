//
// An abstraction layer between OpenGL shader
// functionality and... *the other side*
// (c) 2019 Jani Nykänen
//


export class Shader {


    constructor(gl, vertex, frag) {

        this.gl = gl;
        this.unif = [];
        this.program = this.buildShader(vertex, frag);
        this.getUniformLocations();
    }


    // Get uniform locations
    getUniformLocations() {

        let gl = this.gl;

        // Names
        const NAMES = [
            "transform", 
            "rotation",

            "color",
            "t0",

            "fogColor",
            "fogDensity",
            "lightDir",
            "lightMag",

            "pos",
            "size",
            "texPos",
            "texSize"
        ];

        // Get uniform locations for the each name
        for (let n of NAMES) {

            this.unif[n] = gl.getUniformLocation(
                this.program, n);
        }
    }


    // Create the shader program
    createShader(src, type) {

        let gl = this.gl
    
        // Create & compile
        let shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
    
        // Check for errors
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    
            throw "Shader error:\n" + 
                gl.getShaderInfoLog(shader);
                
        }
    
        return shader;
    }


    // Build the shader (both vertex & fragment)
    buildShader(vertexSrc, fragSrc) {

        let gl = this.gl;
    
        // Create shader components
        let vertex = this.createShader(vertexSrc, 
                gl.VERTEX_SHADER);
        let frag = this.createShader(fragSrc, 
                gl.FRAGMENT_SHADER);
    
        // Create a program
        let program = gl.createProgram();
        // Attach components
        gl.attachShader(program, vertex);
        gl.attachShader(program, frag);
    
        // Bind locations
        this.bindLocations(program);
    
        // Link
        gl.linkProgram(program);
    
        // Check for errors
        if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    
            throw "Shader error: " + 
                gl.getProgramInfoLog(program);
        }
        
        return program;
    }

    
    // Bind default locations
    bindLocations(program) {

        let gl = this.gl;

        gl.bindAttribLocation(program, 0, "vertexPos");
        gl.bindAttribLocation(program, 1, "vertexUV");
        gl.bindAttribLocation(program, 2, "vertexNormal");
    }


    // Make this shader active
    use() {

        let gl = this.gl;
    
        gl.useProgram(this.program);

        // TEMP
        let id = new Float32Array(
            [1, 0, 0, 0,
             0, 1, 0, 0,
             0, 0, 1, 0,
             0, 0, 0, 1]
        );
    
        // Set default uniforms
        gl.uniform1i(this.unif.t0, 0);
        this.setVertexTransform(
            0, 0, 0, 
            1, 1, 1);
        this.setFragTransform(0, 0, 1, 1);
        this.setRotationMatrix(id);
        this.setTransformMatrix(id);
    }


    // Set vertex transform uniform
    // (makes 2D rendering easier)
    setVertexTransform(x, y, z, w, h, d) {

        let gl = this.gl;

        gl.uniform3f(this.unif.pos, x, y, z);
        gl.uniform3f(this.unif.size, w, h, d);
    }


    // Set fragment transform uniform
    // (makes 2D rendering easier)
    setFragTransform(x, y, w, h) {

        let gl = this.gl;

        gl.uniform2f(this.unif.texPos, x, y);
        gl.uniform2f(this.unif.texSize, w, h);
    }


    // Set color uniform
    setColor(r, g, b, a) {

        let gl = this.gl;
        gl.uniform4f(this.unif.color, r, g, b, a);
    }


    // Set the general transformation matrix uniform
    // (mat has to be in Float32 array
    // format)
    setTransformMatrix(mat) {

        let gl = this.gl;

        gl.uniformMatrix4fv(this.unif.transform, 
            false, mat);
    }


    // Set rotation matrix uniform
    // (mat has to be in Float32 array
    // format)
    setRotationMatrix(mat) {

        let gl = this.gl;

        gl.uniformMatrix4fv(this.unif.rotation, 
            false, mat);
    }


    // Set fog uniform
    setFog(d, r, g, b) {

        let gl = this.gl;
    
        gl.uniform4f(this.unif.fogColor, r, g, b, 1.0);
        gl.uniform1f(this.unif.fogDensity, d);
    }


    // Set light uniform
    setLight(mag, x, y, z) {

        let gl = this.gl;
    
        gl.uniform3f(this.unif.lightDir, x, y, z);
        gl.uniform1f(this.unif.lightMag, mag);
    }

}
