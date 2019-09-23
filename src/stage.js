import { Vector3 } from "./vector.js";
import { Surface } from "./surface.js";

//
// Stage
// Renders the game map and does collision
// checking etc
// (c) 2019 Jani Nykänen
//


export class Stage {


    constructor(ev, c, sx, sy, sz) {

        // Generate a surface
        this.surf = new Surface(c.textures.surface, c);

        this.scale = new Vector3(sx, sy, sz);
    }


    // Handle object-to-surface collision
    surfaceCollision(o) {

        let stepx = (1.0 / this.surf.w) * this.scale.x;
        let stepz = (1.0 / this.surf.h) * this.scale.z;

        let x = o.pos.x + this.scale.x/2;
        let z = o.pos.z + this.scale.z/2;

        let tx = Math.floor(x / stepx);
        let tz = Math.floor(z / stepz);

        if (tx < 0 || tz < 0 || tx >= this.surf.w || tz >= this.surf.h)
            return false;

        let px = tx*stepx - this.scale.x/2;
        let pz = tz*stepz - this.scale.z/2;

        // Compute corners
        let topLeft = new Vector3(
            px, 
            this.surf.getHeightValue(tx, tz) * this.scale.y, 
            pz);

        let topRight = new Vector3(
            px + stepx, 
            this.surf.getHeightValue(tx+1, tz) * this.scale.y, 
            pz);

        let bottomRight = new Vector3(
            px + stepx, 
            this.surf.getHeightValue(tx+1, tz+1) * this.scale.y, 
            pz + stepz);

        let bottomLeft = new Vector3(
            px, 
            this.surf.getHeightValue(tx, tz+1) * this.scale.y, 
            pz + stepz);

        return o.planeCollision(topLeft, topRight, bottomRight) ||
               o.planeCollision(bottomRight, bottomLeft, topLeft);

    }


    // Get object-to-stage collisions
    getCollisions(o) {

        this.surfaceCollision(o);
    }


    // Draw map surface
    drawSurface(c) {

        // Draw surface
        c.push();
        c.scale(this.scale.x, this.scale.y, this.scale.z);
        c.translate(-0.5, 0.0, -0.5);
        c.useTransform();

        c.drawMesh(this.surf.mesh, c.textures.snow);
        c.pop();
    }


    // Draw the stage
    draw(c) {

        this.drawSurface(c);
    }
}
