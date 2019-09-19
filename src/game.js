//
// Game scene
// The main gameplay happens here
// (c) 2019 Jani Nykänen
//


export class Game {


    constructor() {

        // ...
    }


    // Initialize the scene
    init(ev) {

        // ...
    }


    // Update the scene
    update(ev) {

        // ...
    }


    // (Re)draw the scene
    draw(c) {

        c.clear(0.70, 0.70, 0.70);

        c.setColor(1, 0, 0, 1);
        c.fillRect(-3.0/8.0, -0.5, 3.0/4.0, 1);
    }

}
