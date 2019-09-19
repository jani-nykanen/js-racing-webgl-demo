//
// Shader sources
// (and shader enums)
// (c) 2019 Jani Nykänen
//


export const ShaderType = {

    DefaultTextured: 0,
    DefaultNoTexture: 1,
    TexturedFogAndLight: 2,
}


// Vertex shaders
export const VertexDefault =
`
attribute vec3 vertexPos;
attribute vec2 vertexUV;
attribute vec3 vertexNormal;
   
uniform mat4 transform;
uniform mat4 rotation;
uniform vec3 pos;
uniform vec3 size;
varying vec2 uv;
varying vec3 rot;
   
void main() {
    vec3 p = vertexPos * size + pos;
    vec4 o = transform * vec4(p, 1);
    gl_Position = o;
    rot = (rotation * vec4(vertexNormal,1)).xyz;
    uv = vertexUV;
}`;
export const VertexNoTex =
`
attribute vec3 vertexPos;
attribute vec2 vertexUV;
attribute vec3 vertexNormal;
   
uniform mat4 transform;

uniform vec3 pos;
uniform vec3 size;
   
void main() {
    vec3 p = vertexPos * size + pos;
    vec4 o = transform * vec4(p, 1);
    gl_Position = o;
}`;


// Fragment shaders
export const FragFogAndLight = 
`
precision mediump float;
 
uniform sampler2D t0;
uniform vec4 color;

uniform vec4 fogColor;
uniform float fogDensity;

uniform vec2 texPos;
uniform vec2 texSize;

uniform vec3 lightDir;
uniform float lightMag;

varying vec2 uv;
varying vec3 rot;

void main() {

    const float DELTA = 0.001;
    vec2 tex = uv;    
    tex.x *= texSize.x;
    tex.y *= texSize.y;
    tex += texPos;

    vec4 res = color * texture2D(t0, tex);
    if(res.a <= DELTA) {
        discard;
    }

    vec4 a = gl_FragCoord;
    float z = a.z / a.w;
    float d = z * fogDensity;
    float fog = 1.0 / exp(d*d);
    fog = clamp(fog, 0.0, 1.0);
    float l = (1.0-lightMag) + lightMag * dot(rot, lightDir);
    gl_FragColor = vec4((1.0-l)*(fog*res.xyz + (1.0-fog)*fogColor.xyz), res.a);
}
`
export const FragTex = 
`
precision mediump float;
 
uniform sampler2D t0;
uniform vec4 color;

uniform vec2 texPos;
uniform vec2 texSize;

varying vec2 uv;

void main() {

    const float DELTA = 0.001;
    vec2 tex = uv;    
    tex.x *= texSize.x;
    tex.y *= texSize.y;
    tex += texPos;

    vec4 res = texture2D(t0, tex);
    if(color.a <= DELTA) {
        discard;
    }
    gl_FragColor = color;
}
`
export const FragNoTex = 
`
precision mediump float;

uniform vec4 color;

void main() {

    gl_FragColor = color;
}
`
