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

        // Start 3D rendering
        c.toggleDepthTest(true);
        c.setPerspective(70.0, c.w / c.h, 0.1, 100.0);
        c.setCamera(0, 0, -1, 0, 0, 0);
        c.loadIdentity();
        c.useTransform();

        c.push();
        c.translate(0, 0, 0);
        c.rotate(this.angle, 1, 0.5, 1);
        c.useTransform();

        c.setColor(1, 1, 1, 1);
        c.drawTexture(c.textures.test,
            -0.5, -0.5, 1, 1);

        
        c.pop();

        // Start 2D rendering
        c.toggleDepthTest(false);
        c.setView2D(c.w, c.h);
        c.useTransform();

        c.setColor(0);
        c.drawText(c.textures.font, "HELLO WORLD",
            2, 2, -1, 0);
    }

}
