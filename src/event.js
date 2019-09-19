//
// Event
// Has information of most things needed
// in the update function (i.e. the function
// that refreshes the game logic)
// (c) 2019 Jani Nykänen
//


export class FrameEvent {


    constructor() {

        this.step = 1;

        // Scenes
        this.scenes = [];
        this.activeScene = null;
    }


    // Initialize all the scenes
    initScenes() {

        for (let s of this.scenes) {

            if (s.init != null) {

                s.init(this);
            }
        }
    }


    // Update event components (like input)
    update() {

        // Call user-defined update function
        if (this.activeScene != null && 
            this.activeScene.update != null) {

            this.activeScene.update(this);
        }
    }


    // Draw the current scene
    drawScene(c) {

        if (this.activeScene != null &&
            this.activeScene.draw != null) {

            this.activeScene.draw(c);
        }
    }


    // Add a scene
    addScene(s, active) {

        this.scenes.push(s);
        if (active)
            this.activeScene = s;
    }
}
