//
// Game scene
// The main gameplay happens here
// (c) 2019 Jani Nykänen
//


export class Game {


    constructor() {

        // ...

        this.angle = 0;
    }


    // Initialize the scene
    // (or the things that need assets, really)
    init(ev) {

        // ...
    }


    // Update the scene
    update(ev) {

        // ...

        this.angle += 0.05 * ev.step;
        this.angle %= Math.PI * 2;
    }


    // (Re)draw the scene
    draw(c) {

        c.clear(0.70, 0.70, 0.70);

        c.setView2D(c.w, c.h);
        c.loadIdentity();
        c.useTransform();

        c.push();
        c.translate(160, 120);
        c.rotate(this.angle, 0, 0, 1);
        c.useTransform();

        c.setColor(1, 0, 0, 1);
        c.fillRect(-32, -32, 64, 64);

        c.pop();
    }

}
