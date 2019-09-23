import { Vector3 } from "./vector.js";
import { Collider } from "./collider.js";

//
// A third person camera, assumably following
// the player
// (c) 2019 Jani Nykänen
//


export class Camera extends Collider {


    constructor(x, y, z) {

        super(x, y, z);

        this.lookAt = new Vector3(x, y, z);
        this.dir = new Vector3();
    }


    // Follow a racer
    followRacer(o) {

        const DIST = 12.0;

        this.lookAt = o.pos.clone();

        this.pos.x = this.lookAt.x - o.left.x * DIST;
        this.pos.z = this.lookAt.z - o.left.z * DIST;
        this.pos.y = this.lookAt.y - o.left.y * DIST + 8 * o.up.y;

        this.dir = o.left.clone();
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
