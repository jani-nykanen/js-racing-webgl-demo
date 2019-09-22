//
// A transformations manager
// Kind of an abstraction layer
// between the user code and the matrix
// library
// (c) 2019 Jani Nykänen
//


export class Transformations {


    constructor() {

        // Matrices
        this.model = glMatrix.mat4.create();
        this.view = glMatrix.mat4.create();
        this.projection = glMatrix.mat4.create();
        this.product = glMatrix.mat4.create();
        this.rotation = glMatrix.mat4.create();

        // Stack
        this.stack = [];
        this.rotStack = [];

        this.productComputed = false;

        this.activeShader = null;
    }


    // Set model & rotation matrix to the identity
    // matrix
    loadIdentity() {

        glMatrix.mat4.identity(this.model);
        glMatrix.mat4.identity(this.rotation);
    }


    // Translate
    translate(x, y, z) {

        if (z == null) z = 0;

        glMatrix.mat4.translate(
            this.model, this.model, 
            glMatrix.vec3.fromValues(x, y, z)
            );

        this.productComputed = false;
    }


    // Scale
    scale(x, y, z) {

        if (z == null) z = 0;

        glMatrix.mat4.scale(
            this.model, this.model, 
            glMatrix.vec3.fromValues(x, y, z)
            );

        this.productComputed = false;
    }


    // Rotate
    rotate(angle, x, y, z) {

        if (x == null) {

            x = 0; y = 0; z = 1;
        }

        glMatrix.mat4.rotate(
            this.model, this.model, angle,
            glMatrix.vec3.fromValues(x, y, z)
            );
        
        glMatrix.mat4.rotate(
            this.rotation, this.rotation, angle,
            glMatrix.vec3.fromValues(x, y, z)
            );

        this.productComputed = false;
    }


    // Set a basic camera projection, pointing
    // to a given point
    setCamera(cx, cy, cz, tx, ty, tz) {

        glMatrix.mat4.lookAt(this.view,
            glMatrix.vec3.fromValues(cx, cy, cz),
            glMatrix.vec3.fromValues(tx, ty, tz),
            glMatrix.vec3.fromValues(0, 1, 0));

        this.productComputed = false;
    }


    // Set 2D projection (i.e ortho 2D)
    setView2D(w, h) {

        glMatrix.mat4.ortho(this.projection,
            0, w, h, 0, -1, 1);
        glMatrix.mat4.identity(this.view);

        this.productComputed = false;
    }


    // Set perspective projection
    setPerspective(fovY, ratio, near, far) {

        glMatrix.mat4.perspective(this.projection,
            fovY / 180.0 * Math.PI, 
            ratio, near, far);

        this.productComputed = false;
    }


    // Push the current model matrix to the stack
    push() {

        const MAX_LEN = 64;
        if (this.stack.length == MAX_LEN) {

            throw "A risk for stack overflow!";
        }

        this.stack.push(glMatrix.mat4.clone(this.model));
        this.rotStack.push(glMatrix.mat4.clone(this.rotation));
    }


    // Return the model matrix from the stack and 
    // make active
    pop() {

        this.model = this.stack.pop();
        this.rotation = this.rotStack.pop();

        this.productComputed = false;
    }
    

    // Compute product
    computeProduct() {

        if (this.productComputed) return;

        // TODO: Check order
        glMatrix.mat4.mul(this.product, 
            this.view, this.model);
        glMatrix.mat4.mul(this.product, 
            this.projection, this.product);

        this.productComputed = true;
    }


    // Use transform
    useTransform() {

        if (this.activeShader == null)
            return;

        this.computeProduct();

        this.activeShader.setTransformMatrix(this.product);
        this.activeShader.setRotationMatrix(this.rotation);
    }
}
