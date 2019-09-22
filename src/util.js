import { Vector3 } from "./vector.js";

//
// Simple utility functions
// (c) 2019 Jani Nykänen
//



// Negative modulo
export function negMod(m, n) {

    if(m < 0) {

        return n - (-m % n);
    }
    return m % n;
}


// Clamp a number to the range [min, max]
export function clamp(x, min, max) {

    return Math.max(min, Math.min(x, max));
}


// Toggle fullscreen
export function toggleFullscreen(canvas) {

    // console.log("No.");

    if(document.webkitIsFullScreen || 
        document.mozFullScreen) {

        if(document.webkitExitFullscreen)
            document.webkitExitFullscreen();
        
        else if(document.mozCancelFullScreen)
            document.mozCancelFullScreen();

        else if(document.exitFullscreen)
            document.exitFullscreen();    
    }
    else {

        if(canvas.webkitRequestFullscreen)
            canvas.webkitRequestFullscreen();

        else if(canvas.requestFullscreen) 
            canvas.requestFullscreen();

        else if(canvas.mozRequestFullScreen) 
            canvas.mozRequestFullScreen();
        
    }
}


// Is a point inside a triangle
export function isInsideTriangle(
    px, py, x1, y1, x2, y2, x3, y3) {

    let as_x = px-x1;
    let as_y = py-y1;
    let s_ab = (x2-x1)*as_y-(y2-y1)*as_x > 0;

    return !(((x3-x1)*as_y-(y3-y1)*as_x > 0) == s_ab || 
        ((x3-x2)*(py-y2)-(y3-y2)*(px-x2) > 0) != s_ab);
}


// Cross-product
export function cross(v1, v2) {

    return new Vector3(
        v1.y*v2.z - v2.y*v1.z,
        v1.x*v2.z - v2.x*v1.z,
        v1.x*v2.y - v2.x*v1.y
    );
}
