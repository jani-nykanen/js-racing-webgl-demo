import { Core } from "./core.js";
import { Game } from "./game.js";

//
// Main file
// (c) 2019 Jani Nykänen
//


window.onload = () => {

    let c = new Core({
        canvasWidth: 320,
        canvasHeight: 240,
        frameRate: 60,
    });

    // Add scenes
    c.addScenes(new Game());

    c.run();
}
