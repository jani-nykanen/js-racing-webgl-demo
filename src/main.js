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
        {name: "font",   src: "assets/bitmaps/font.png"},
        {name: "donkey", src: "assets/bitmaps/donkey.png"},
        {name: "surface", src: "assets/bitmaps/surface.png", preserve: true},
        {name: "snow", src: "assets/bitmaps/snow.png"},
        {name: "shadow", src: "assets/bitmaps/shadow.png"},
    );
    c.assets.addMeshes(
        {name: "horse",  src: "assets/models/horse.obj"},
    );

    // Configure keys
    c.configActions(
        {name: "left", key: 37},
        {name: "up", key: 38},
        {name: "right", key: 39},
        {name: "down", key: 40},

        {name: "fire1", key: 32},
        {name: "fire2", key: 90},

        {name: "start", key: 13},
        {name: "back", key: 27},
    )

    c.run();
}
