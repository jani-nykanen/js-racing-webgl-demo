import { State } from "./input.js";
import { Vector3 } from "./vector.js";
import { clamp, negMod } from "./util.js";
import { Racer } from "./racer.js";
import { Surface } from "./surface.js";

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

            this.racers[i] = new Racer(0, 0, 0, i > 0);
        }

        // Set initial values
        this.angle = new Vector3();
    }


    // Initialize the scene
    // (or the things that need assets, really)
    init(ev, c) {

        

        // Generate a surface
        this.surf = new Surface(c.textures.surface, c);
    }


    // Update the scene
    update(ev) {

        // Update racers
        for (let r of this.racers) {

            r.update(ev);
        }
    }


    // (Re)draw the scene
    draw(c) {

        c.clear(0.70, 0.70, 0.70);

        // Start 3D rendering
        c.toggleDepthTest(true);
        c.resetCoordinateTransition();
        c.setPerspective(70.0, c.w / c.h, 0.1, 100.0);
        c.setCamera(0, 4, -7, 0, 0, 0);
        c.loadIdentity();
        c.useTransform();

        // Set light & fog
        c.toggleFogAndLighting(true);
        c.setLighting(1.0, 0, 0, 1);
        c.setFog(0.125, 0, 0, 0);

        // Draw surface
        c.push();
        c.translate(-0.5, 0, -0.5);
        c.rotate(this.racers[0].angle, 0, 1, 0);
        c.translate(0.5, 0, 0.5);
        
        c.scale(10, 8, 10);
        c.translate(-0.5, -0.5, -0.5);

        c.useTransform();
        c.drawMesh(this.surf.mesh, c.textures.snow);
        c.pop();

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
            2, 2, -1, 0);
    }

}
