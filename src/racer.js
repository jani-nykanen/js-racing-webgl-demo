import { Vector3 } from "./vector.js";
import { State } from "./input.js";
import { negMod } from "./util.js";

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

        this.angle = 0;
        this.angleSpeed = 0;
        this.angleTarget = 0;

        this.ai = ai;
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
        c.translate(this.pos.x, this.pos.y, this.pos.z);
        c.rotate(-Math.PI/2 + this.angle, 0, 1, 0);
        c.useTransform();

        c.setColor();
        c.drawMesh(c.meshes.horse, c.textures.donkey);

        c.pop();
    }

}
