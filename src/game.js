import { State } from "./input.js";
import { Vector3 } from "./vector.js";
import { clamp, negMod } from "./util.js";
import { Racer } from "./racer.js";
import { Surface } from "./surface.js";
import { Stage } from "./stage.js";
import { Camera } from "./camera.js";

//
// Game scene
// The main gameplay happens here
// (c) 2019 Jani Nykänen
//


export class Game {


    constructor() {

        const RACER_COUNT = 1;

        // Create racers (the racer in index 0 is
        // the player racer)
        this.racers = new Array(RACER_COUNT);
        for (let i = 0; i < RACER_COUNT; ++ i) {

            this.racers[i] = new Racer(0.0001, 32, 0.0001, i > 0);
        }

        // Set initial values
        this.angle = new Vector3();

        this.cam = new Camera();
    }


    // Initialize the scene
    // (or the things that need assets, really)
    init(ev, c) {

        // Create stage
        this.stage = new Stage(ev, c, 64.0, 32.0, 64.0);
    }


    // Update the scene
    update(ev) {

        // Update racers
        for (let r of this.racers) {

            r.update(ev);
            this.stage.getCollisions(r);
        }

        this.cam.followRacer(this.racers[0]);
        this.cam.updateAnimation(ev);
        this.stage.getCollisions(this.cam);
        
    }


    // (Re)draw the scene
    draw(c) {

        c.clear(0.70, 0.70, 0.70);

        // Start 3D rendering
        c.toggleDepthTest(true);
        c.resetCoordinateTransition();
        c.setPerspective(70.0, c.w / c.h, 0.1, 100.0);
        // TEMP
        this.cam.use(c);
        c.loadIdentity();
        c.useTransform();

        // Set light & fog
        c.toggleFogAndLighting(true);
        //c.setLighting(0.75, 0, -1.0 / Math.sqrt(2), 1.0 / Math.sqrt(2));
        c.setLighting(0.75, this.cam.dir.x, this.cam.dir.y, this.cam.dir.z);
        c.setFog(0.035, 0, 0, 0);

        // Draw stage
        this.stage.draw(c);

        // Draw racers
        for (let r of this.racers) {

            r.draw(c);
        }

        // Start 2D rendering
        c.toggleDepthTest(false);
        c.toggleFogAndLighting(false);
        c.setView2D(c.w, c.h);
        c.useTransform();

        c.setColor(0);
        c.drawText(c.textures.font, "USE ARROW KEYS.\nFOR FUN.",
            3, 3, -1, 0);

        c.setColor(1);
        c.drawText(c.textures.font, "USE ARROW KEYS.\nFOR FUN.",
            2, 2, -1, 0);
    }

}
