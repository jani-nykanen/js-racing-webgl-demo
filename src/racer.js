import { Vector3 } from "./vector.js";
import { State } from "./input.js";
import { negMod, isInsideTriangle, cross } from "./util.js";

//
// A racer object
// Can be controlled manually by the player,
// or by a simple AI
// (c) 2019 Jani Nykänen
//


export class Racer {


    constructor(x, y, z, ai) {

        this.pos = new Vector3(x, y, z);
        this.speed = new Vector3();
        this.target = new Vector3();

        // Directorial vectors
        this.front = new Vector3(0, 0, 1);
        this.left = new Vector3(-1, 0, 0);
        this.up = new Vector3(0, 1, 0);

        // These will be used to compute the left & front vectors
        this.frontDir = new Vector3(0, 0, 1);
        this.leftDir = new Vector3(-1, 0, 0);

        this.angle = 0;
        this.angleSpeed = 0;
        this.angleTarget = 0;

        this.ai = ai;
    }


    // Generate an orthogonal matrix
    // for rotatoin
    genRotation() {

        this.front.normalize();
        this.left.normalize();
        this.up.normalize();
    }


    // A helper function that updates a 
    // "speed axis", like actual speed or
    // angle speed
    updateSpeedAxis(speed, target, d) {

        if (speed < target) {

            speed = Math.min(speed + d, target);
        }
        else if (speed > target) {

            speed = Math.max(speed - d, target);
        }
        return speed;
    }


    // Control manually
    control(ev) {

        const ANGLE_TARGET = 0.05;
        const MOVE_SPEED = 0.15;

        let angleDir = 0;
        let moveDir = 0;

        // Check rotation
        if (ev.input.action.left.state == State.Down) {

            angleDir = 1;
        }
        else if (ev.input.action.right.state == State.Down) {

            angleDir = -1;
        }
        // Compute angle speed target
        this.angleTarget = ANGLE_TARGET * angleDir;

        // Move forward/backward
        if (ev.input.action.up.state == State.Down) {

            moveDir = 1;
        }
        else if (ev.input.action.down.state == State.Down) {

            moveDir = -1;
        }

        // Compute target position
        this.target.x = moveDir * 
            Math.sin(this.angle) * 
            MOVE_SPEED;
        this.target.z = moveDir * 
            Math.cos(this.angle) * 
            MOVE_SPEED;
    }


    // Update the racer movement
    move(ev) {

        const MOVE_DELTA = 0.01;
        const ANGLE_DELTA = 0.005;

        // Update speed axes
        this.speed.x = this.updateSpeedAxis(
            this.speed.x, this.target.x, 
            MOVE_DELTA * ev.step);
        this.speed.z = this.updateSpeedAxis(
            this.speed.z, this.target.z, 
            MOVE_DELTA * ev.step);

        // Update rotation speed
        this.angleSpeed  = this.updateSpeedAxis(
            this.angleSpeed, 
            this.angleTarget, 
            ANGLE_DELTA * ev.step);

        // Update position
        this.pos.x += this.speed.x * ev.step;
        this.pos.z += this.speed.z * ev.step;

        // Update angle
        this.angle += this.angleSpeed * ev.step;
        this.angle = negMod(this.angle, Math.PI*2);

        // Update front & left vectors
        this.frontDir.x = Math.cos(this.angle);
        this.frontDir.z = -Math.sin(this.angle);

        this.leftDir.x = -this.frontDir.z;
        this.leftDir.z = this.frontDir.x;

        this.left = this.leftDir.clone();
        this.front = this.frontDir.clone();
    }


    // Update the racer
    update(ev) {

        if (!this.ai)
            this.control(ev);
        this.move(ev);
    }


    // Draw the racer
    draw(c) {

        c.push();
        c.translate(this.pos.x, this.pos.y + 2.0, this.pos.z);
        //c.rotate(Math.PI/2, 0, 1, 0);
        c.setBasis(this.left, this.up, this.front);
        c.useTransform();

        c.setColor();
        c.drawMesh(c.meshes.horse, c.textures.donkey);

        c.pop();
    }


    // Collision with a triangular plane piece
    planeCollision(A, B, C) {

        const EPS = 0.0001;

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
        n.y *= -1;

        // Interpret: Plane equation, where n = (a,b,c),
        // and we need d
        let d = -(n.x * A.x + n.y * A.y + n.z * A.z);
    
        // Check if below the plane
        let cy = -(this.pos.x*n.x + this.pos.z*n.z + d) / n.y;
        //if(this.speed.y < 0.0 &&
         //   this.pos.y > cy-UP_FRAME * ev.step && 
         //   this.pos.y < cy+(this.speed.y+BOTTOM_FRAME) * v.step ) {
    
           // this.speed.y = 0.0;
        this.pos.y = cy;

        //}

        // Generate basis for rotation
        this.up = new Vector3(-n.x, -n.y, -n.z);

        let dy = -( (this.pos.x+this.frontDir.x)*n.x + 
                    (this.pos.z+this.frontDir.z)*n.z + d) 
                    / n.y;
        this.front = new Vector3(
            this.frontDir.x, dy-cy, this.frontDir.z);
        this.front.normalize();

        dy = -( (this.pos.x+this.leftDir.x)*n.x + 
                    (this.pos.z+this.leftDir.z)*n.z + d) 
                    / n.y;
        this.left = new Vector3(
            this.leftDir.x, dy-cy, this.leftDir.z);
        this.left.normalize();

  
        return true;
    }

}
