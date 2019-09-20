import { State } from "./input.js";
import { Vector3 } from "./vector.js";
import { clamp, negMod } from "./util.js";

//
// Game scene
// The main gameplay happens here
// (c) 2019 Jani Nykänen
//


export class Game {


    constructor() {

        // ...

        this.angle = new Vector3();
    }


    // Initialize the scene
    // (or the things that need assets, really)
    init(ev) {

        // ...
    }


    // Update the scene
    update(ev) {

        // ...

        let dx = 0;
        let dy = 0;

        // If enter pressed, reset cube angle
        if (ev.input.action.start.state == State.Pressed) {

            this.angle.x = 0;
            this.angle.y = 0;
        }

        // Check arrow keys
        if (ev.input.action.left.state == State.Down) {

            dy = -1;
        }
        else if (ev.input.action.right.state == State.Down) {

            dy = 1;
        }
        if (ev.input.action.up.state == State.Down) {

            dx = -1;
        }
        else if (ev.input.action.down.state == State.Down) {

            dx = 1;
        }

        this.angle.x += 0.05 * dx * ev.step;
        this.angle.x = negMod(this.angle.x, Math.PI*2);

        this.angle.y += 0.05 * dy * ev.step;
        this.angle.y = negMod(this.angle.y, Math.PI*2);
    }


    // (Re)draw the scene
    draw(c) {

        c.clear(0.70, 0.70, 0.70);

        // Start 3D rendering
        c.toggleDepthTest(true);
        c.resetCoordinateTransition();
        c.setPerspective(70.0, c.w / c.h, 0.1, 100.0);
        c.setCamera(0, 4, -6, 0, 0, 0);
        c.loadIdentity();
        c.useTransform();

        // Set light & fog
        c.toggleFogAndLighting(true);
        c.setLighting(1.0, 0, 0, 1);
        c.setFog(0.15, 0, 0, 0);

        // Set transformation
        c.push();
        c.translate(0, 0, 0);
        c.rotate(this.angle.x, 1, 0, 0);
        c.rotate(this.angle.y, 0, 1, 0);
        c.useTransform();

        c.setColor();
        c.drawMesh(c.meshes.horse, c.textures.donkey);

        c.pop();

        // Start 2D rendering
        c.toggleDepthTest(false);
        c.toggleFogAndLighting(false);
        c.setView2D(c.w, c.h);
        c.useTransform();

        c.setColor(0);
        c.drawText(c.textures.font, "USE ARROW KEYS.\nFOR FUN.",
            2, 2, -1, 0);
    }

}
