import { Vector3 } from "./vector.js";
import { isInsideTriangle, cross } from "./util.js";

//
// An object that takes collision
// (c) 2019 Jani Nykänen
//


export class Collider {


    constructor(x, y, z) {

        this.pos = new Vector3(x, y, z);
        this.speed = new Vector3();
        this.target = new Vector3();

        this.height = 0;
    }


    // A collision with a plane, restricted (and
    // defined) by a three points
    planeCollision(A, B, C) {

        const EPS = 0.0001;
        const TOP_OFF = 0.01;

        // Check if inside the collision triangle
        if(!isInsideTriangle(this.pos.x, this.pos.z,
            A.x,A.z, B.x,B.z, C.x,C.z)) 
            return false;
    
        let v1 = new Vector3(B.x-A.x, B.y-A.y, B.z-A.z);
        let v2 = new Vector3(C.x-A.x, C.y-A.y, C.z-A.z);
    
        // Cross product
        // (It is faster to do this this way than in the
        //  matrix library)
        let n = cross(v1, v2);
        if(Math.abs(n.y) < EPS ) return false;
        
        n.normalize();
   
        // Interpret: Plane equation, where n = (a,b,c),
        // and we need d
        let d = -(n.x * A.x + n.y * A.y + n.z * A.z);
        let dn = Math.sqrt(n.x*n.x + n.y*n.y + n.z*n.z);
        let dist = Math.abs(n.x * this.pos.x + n.y * this.pos.y + n.z * this.pos.z + d) / dn;
    
        // Check if below the plane
        let cy = -(this.pos.x*n.x + this.pos.z*n.z + d) / n.y;
        if(this.pos.y-this.height < cy + TOP_OFF) {
    
            // this.speed.y = 0.0;
            // this.pos.y = cy + this.height;

            if (typeof(this.setOrientation) == "function") {

                this.setOrientation(cy, n, d, dist);
            }
            else {

                this.pos.y = cy + this.height;
            }
        }

        
    }
}
