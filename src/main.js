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

    // Set assets loading
    c.assets.addTextures(
        {name: "test", src: "assets/bitmaps/test.png"},
        {name: "font", src: "assets/bitmaps/font.png"},
    );
    c.assets.addMeshes(
        {name: "cube", src: "assets/models/cube.obj"},
    );

    c.run();
}
