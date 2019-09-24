import { Vector3 } from "./vector.js";
import { State } from "./input.js";
import { negMod, isInsideTriangle, cross, dot, updateSpeedAxis, updateVectorMovement } from "./util.js";
import { Collider } from "./collider.js";

//
// A racer object
// Can be controlled manually by the player,
// or by a simple AI
// (c) 2019 Jani Nykänen
//


export class Racer extends Collider {


    constructor(x, y, z, ai) {
        
        super(x, y, z);

        this.targetLen = 0;

        // Directorial vectors
        this.front = new Vector3(0, 0, 1);
        this.left = new Vector3(-1, 0, 0);
        this.up = new Vector3(0, 1, 0);

        // Pose vectors
        this.poseUp = this.up.clone();
        this.poseFront = this.front.clone();
        this.poseLeft = this.left.clone();

        // These will be used to compute the left & front vectors
        this.frontDir = new Vector3(0, 0, 1);
        this.leftDir = new Vector3(-1, 0, 0);
        
        // Angle stuff
        this.angle = 0;
        this.angleSpeed = 0;
        this.angleTarget = 0;

        this.ai = ai;

        // Jumping variables
        this.jumpTimer = 0.0;
        this.jumpDir = new Vector3();
        this.canJump = false;
    }


    // Generate an orthogonal matrix
    // for rotatoin
    genRotation() {

        this.front.normalize();
        this.left.normalize();
        this.up.normalize();
    }


    // Control manually
    control(ev) {

        const ANGLE_TARGET = 0.05;
        const MOVE_SPEED = 0.25;
        const BASE_GRAVITY = -1.0;
        const JUMP_SPEED = 1.0;

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

        // Jump
        let s = ev.input.action.fire1.state;
        if (this.canJump &&
            s == State.Pressed) {

            this.speed.x += this.up.x * JUMP_SPEED;
            this.speed.y += this.up.y * JUMP_SPEED;
            this.speed.z += this.up.z * JUMP_SPEED;
        }

        if (!this.canJump && this.speed.y > 0.0 &&
            s == State.Released) {

            this.speed.y /= 2;
        }

        // Compute target position
        this.target.x = moveDir * 
            Math.sin(this.angle) * 
            MOVE_SPEED;
        this.target.z = moveDir * 
            Math.cos(this.angle) * 
            MOVE_SPEED;
        this.target.y = BASE_GRAVITY;
    }


    // Update the racer movement
    move(ev) {

        const MOVE_DELTA = 0.01;
        const ANGLE_DELTA = 0.005;
        const GRAVITY_DELTA = 0.025;
        const VECTOR_DIV = 10;

        // Update speed axes
        this.speed.x = updateSpeedAxis(
            this.speed.x, this.target.x, 
            MOVE_DELTA * ev.step);
        this.speed.z = updateSpeedAxis(
            this.speed.z, this.target.z, 
            MOVE_DELTA * ev.step);
        this.speed.y = updateSpeedAxis(
            this.speed.y, this.target.y, 
            GRAVITY_DELTA * ev.step);

        // Update rotation speed
        this.angleSpeed  = updateSpeedAxis(
            this.angleSpeed, 
            this.angleTarget, 
            ANGLE_DELTA * ev.step);

        // Update position
        this.pos.x += this.speed.x * ev.step;
        this.pos.z += this.speed.z * ev.step;
        this.pos.y += this.speed.y * ev.step;

        // Update angle
        this.angle += this.angleSpeed * ev.step;
        this.angle = negMod(this.angle, Math.PI*2);

        // Update pose vectors
        updateVectorMovement(this.poseFront, this.front, VECTOR_DIV, ev.step);
        updateVectorMovement(this.poseLeft, this.left, VECTOR_DIV, ev.step);
        updateVectorMovement(this.poseUp, this.up, VECTOR_DIV, ev.step);

        // Update front & left vectors
        this.frontDir.x = Math.cos(this.angle);
        this.frontDir.z = -Math.sin(this.angle);

        // Compute default directions
        this.leftDir.x = -this.frontDir.z;
        this.leftDir.z = this.frontDir.x;

        this.left = this.leftDir.clone();
        this.front = this.frontDir.clone();
        this.up = new Vector3(0, 1, 0);

        // We ignore y axis because it makes
        // camera go wonky
        this.targetLen = Math.hypot(this.target.x, this.target.z);
    }


    // Update the racer
    update(ev) {

        if (!this.ai)
            this.control(ev);
        this.move(ev);

        this.canJump = false;
    }


    // Draw the racer
    draw(c) {

        c.push();
        c.translate(this.pos.x, this.pos.y + 2.0, this.pos.z);
        //c.rotate(Math.PI/2, 0, 1, 0);
        c.setBasis(this.poseLeft, this.poseUp, this.poseFront);
        c.useTransform();

        c.setColor();
        c.drawMesh(c.meshes.horse, c.textures.donkey);

        c.pop();
    }


    // Set orientation
    setOrientation(cy, n, d) {

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
        this.left = cross(this.front, this.up);
        this.left.normalize();

        this.canJump = true;

    }

}
