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
        this.dist = 10;
        this.distTarget = this.dist;

        // To get collisions working properly
        this.speed.y = -1;
    }


    // Follow a racer
    followRacer(o) {

        const UP_DIST = 8;
        const DIST_MIN = 8.0;
        const DIST_MUL = 8.0;

        this.lookAt = o.pos.clone();
        this.target = o.poseLeft.clone();
        this.upTarget = UP_DIST * o.poseUp.y;

        this.distTarget = DIST_MIN + o.targetLen*DIST_MUL;
    }


    // Update camera animation
    updateAnimation(ev) {

        const SPEED_DIV = 16;

        // Update distance
        this.dist = updateSpeedAxis(this.dist, this.distTarget, 0.05 * ev.step);

        // Update directional vector
        updateVectorMovement(this.dir, this.target, SPEED_DIV, ev.step);
        
        this.pos.x = this.lookAt.x - this.dir.x * this.dist;
        this.pos.z = this.lookAt.z - this.dir.z * this.dist;
        this.pos.y = this.lookAt.y - this.dir.y * this.dist + this.up;

        // Update up direction
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
            this.lookAt.y + 2, 
            this.lookAt.z);
    }
}
