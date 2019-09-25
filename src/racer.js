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

        this.moveDir = 0;
        this.acc = 0.0;
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

        const ANGLE_TARGET = 0.033;
        const FORWARD_SPEED = 1.0;
        const BACKWARD_SPEED = 0.20;
        const BASE_GRAVITY = -1.0;
        const JUMP_TIME = 15;

        let angleDir = 0;
        

        // Check rotation
        if (ev.input.action.left.state == State.Down) {

            angleDir = 1;
        }
        else if (ev.input.action.right.state == State.Down) {

            angleDir = -1;
        }
        // Compute angle speed target
        angleDir *= 1.0 + Math.hypot(this.speed.x, this.speed.z);
        this.angleTarget = ANGLE_TARGET * angleDir;

        // Move forward/backward
        let speed = FORWARD_SPEED;
        this.moveDir = 0;
        if (ev.input.action.up.state == State.Down) {

            this.moveDir = 1;
        }
        else if (ev.input.action.down.state == State.Down) {

            this.moveDir = -1;
            speed = BACKWARD_SPEED;
        }

        let dx = this.moveDir * Math.sin(this.angle);
        let dz = this.moveDir * Math.cos(this.angle)

        // Jump
        let s = ev.input.action.fire1.state;
        if (this.canJump &&
            s == State.Pressed) {

            this.jumpDir.x = this.up.x + dx;
            this.jumpDir.y = this.up.y;
            this.jumpDir.z = this.up.z + dz;
            this.jumpDir.normalize();

            this.jumpTimer = JUMP_TIME;
        }

        if (this.jumpTimer > 0.0 &&
            s == State.Released) {

            this.jumpTimer = 0.0;
        }
        
        if (this.canJump) {

            this.target.x = dx * speed;
            this.target.z = dz * speed;

            // Apply friction
            this.target.x += this.up.x * (speed/2);
            this.target.z += this.up.z * (speed/2);
        }
        this.target.y = BASE_GRAVITY;  

        // We ignore y axis because it makes
        // camera go wonky
        this.targetLen = Math.hypot(this.target.x, this.target.z);
    }


    // Update the racer movement
    move(ev) {

        const MOVE_DELTA = 0.01;
        const ANGLE_DELTA = 0.005;
        const GRAVITY_DELTA = 0.025;
        const VECTOR_DIV = 10;
        const JUMP_SPEED = 0.75;
        const EPS = 0.0001;
        const BRAKE_SPEED = MOVE_DELTA;
        const BACKWARD_ACC = 1.0;

        // Compute acceleration
        let s = Math.hypot(this.speed.x, this.speed.z);
        if (this.canJump) {

            this.acc = MOVE_DELTA * 1.0 / Math.sqrt(Math.exp(s));
            if (this.moveDir == -1) {

                this.acc = BRAKE_SPEED * 2;

                // Stop braking and start moving backwards
                if((Math.abs(this.target.x) < EPS || 
                    this.speed.x/this.target.x >= 0) &&
                    (Math.abs(this.target.y) < EPS || 
                    this.speed.z/this.target.z >= 0)) {

                    this.acc = BACKWARD_ACC;
                }
            }
        }

        // Update jumping
        if (this.jumpTimer > 0.0) {

            this.jumpTimer -= ev.step;
            this.speed = this.jumpDir.clone();
            this.speed.scalarMul(JUMP_SPEED);
        }

        // Update speed axes
        this.speed.x = updateSpeedAxis(
            this.speed.x, this.target.x, 
            this.acc * ev.step);
        this.speed.z = updateSpeedAxis(
            this.speed.z, this.target.z, 
            this.acc * ev.step);
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

        this.shadowPos.x = this.pos.x;
        this.shadowPos.y = this.pos.y;
    }


    // Update the racer
    update(ev) {

        if (!this.ai)
            this.control(ev);
        this.move(ev);

        this.canJump = false;
    }


    // Draw shadow
    drawShadow(c) {

        const SHADOW_ALPHA = 0.25;
        const SCALE_MIN = 4;
        const SCALE_FACTOR = 8;

        let scale = Math.max(0, 
            SCALE_MIN - (this.pos.y-this.shadowPos.y)/SCALE_FACTOR);

        c.push();
        c.translate(this.pos.x, this.shadowPos.y, this.pos.z);
        c.setBasis(this.poseLeft, this.poseUp, this.poseFront);
        c.scale(scale, 1, scale);
        c.useTransform();

        c.toggleDepthTest(false);

        c.setColor(0, 0, 0, SHADOW_ALPHA);
        c.drawMesh(c.mRectXZ, c.textures.shadow);

        c.toggleDepthTest(true);

        c.pop();
        c.useTransform();
    }


    // Draw the racer
    draw(c) {

        this.drawShadow(c);

        c.push();
        c.translate(this.pos.x, this.pos.y, this.pos.z);
        c.setBasis(this.poseLeft, this.poseUp, this.poseFront);
        c.useTransform();

        c.setColor();
        c.resetCoordinateTransition();
        c.drawMesh(c.meshes.horse, c.textures.donkey);

        c.pop();
    }


    // Set orientation
    setOrientation(cy, n, d, dist) {

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

        dist = Math.abs(dist);

        // Update position
        //this.pos.x -= n.x * dist;
        //this.pos.y -= n.y * dist;
        //this.pos.z -= n.z * dist;

        this.pos.y = cy;

    }

}
