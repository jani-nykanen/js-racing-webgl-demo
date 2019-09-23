import { Vector3 } from "./vector.js";
import { Collider } from "./collider.js";
import { updateVectorMovement, updateSpeedAxis } from "./util.js";

//
// A third person camera, assumably following
// the player
// (c) 2019 Jani Nykänen
//


export class Camera extends Collider {


    constructor(x, y, z) {

        super(x, y, z);

        this.target = this.pos.clone();
        this.lookAt = new Vector3(x, y, z);
        this.dir = new Vector3();

        this.up = 0;
        this.upTarget = 0;

        this.height = 1.0;
    }


    // Follow a racer
    followRacer(o) {

        const UP_DIST = 8;

        this.lookAt = o.pos.clone();
        this.target = o.poseLeft.clone();
        this.upTarget = UP_DIST * o.poseUp.y;;
    }


    // Update camera animation
    updateAnimation(ev) {

        const DIST = 12.0;
        const UP_SPEED = 0.01;
        const SPEED_DIV = 16;

        updateVectorMovement(this.dir, this.target, SPEED_DIV, ev.step);
        
        this.pos.x = this.lookAt.x - this.dir.x * DIST;
        this.pos.z = this.lookAt.z - this.dir.z * DIST;
        this.pos.y = this.lookAt.y - this.dir.y * DIST + this.up;

        this.up = updateSpeedAxis(
            this.up, 
            this.upTarget, 
            Math.abs(this.up-this.upTarget)/SPEED_DIV*ev.step);
    }


    // Set camera tranformation
    use(c) {

        c.setCamera(
            this.pos.x, this.pos.y, this.pos.z,
            this.lookAt.x, 
            this.lookAt.y, 
            this.lookAt.z);
    }
}
