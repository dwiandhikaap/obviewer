import { Geometry, Mesh, Renderer, RenderTexture, Shader } from "pixi.js";
import { Vector2 } from "../../../math/Vector2";

/* 
    learning how to render a fucking line with shading in 8 hours CHALLENGE™
*/

const JOINS_SUBDIVISION = 32;

const CENTER_DEPTH = -1.0;
const EDGE_DEPTH = 1.0;

const vertexShaderSource = `
    attribute vec3 a_position;

    uniform vec2 u_resolution;
    uniform vec2 u_offset;
    
    void main() {
        // i heard pixi can handle the projection using some uniform but fuck that amirite

        float x = (a_position[0] + u_offset[0]) / u_resolution[0] * 2.0 - 1.0;
        float y = (a_position[1] + u_offset[1]) / u_resolution[1] * 2.0 - 1.0;
        float z = a_position[2];

        gl_Position = vec4(x, y, z, 1);
    }
`;

const fragmentShaderSource = `
    precision mediump float;

    vec4 borderColor = vec4(1,1,1,1);
    
    float contrast = 0.5; // is it really called contrast doe ???
    float brightness = 0.75;

    float bodyEnd = 0.825;
    float borderEnd = 0.925;
    float shadowEnd = 1.0;

    bool isBody(float u){
        return u >= -1.0 && u < bodyEnd;
    }

    bool isBorder(float u){
        return u >= bodyEnd && u < borderEnd;
    }

    bool isShadow(float u){
        return u >= borderEnd && u <= shadowEnd;
    }

    vec4 getBodyColor(float u){
        float u2 = smoothstep(1.0 + contrast, -1.0 - contrast , u) * brightness;
        return vec4(u2,u2,u2, 1.0);
    }

    vec4 getShadowColor(float u){
        float alpha = smoothstep(shadowEnd, borderEnd, u) / 2.0;
        return vec4(0,0,0,alpha);
    }

    void main(){
        float u = gl_FragCoord.z;

        if(isBody(u)){
            gl_FragColor = getBodyColor(u);
            return;
        }

        if(isBorder(u)){
            gl_FragColor = borderColor;
            return;
        }

        if(isShadow(u)){
            gl_FragColor = getShadowColor(u);
            return;
        }
    }

    // oh no!! rough edges????
    // https://www.youtube.com/watch?v=kXLu_x0SRm4
`;

function calculateQuad(points: Vector2[], radius: number, offset: number = 0) {
    const positions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];

        const vec = Vector2.Subtract(next, curr);
        const normRight = Vector2.PerpendicularRight(vec).normalize().multiply(radius);
        const normLeft = Vector2.PerpendicularLeft(vec).normalize().multiply(radius);

        /* something like this, 3 as the start, 4 as the end. 
           McOsu has 4 as the start and 3 as the end, but whatever lol
    *   1   3   5
        *---*---*
        |  /|  /|
        | / | / |
        |/  |/  |
        *---*---*
    *   2   4   6
        */

        const p1 = Vector2.Add(curr, normLeft);
        const p2 = Vector2.Add(next, normLeft);
        const p3 = curr.clone();
        const p4 = next.clone();
        const p5 = Vector2.Add(curr, normRight);
        const p6 = Vector2.Add(next, normRight);

        for (let j = 0; j < 4; j++) {
            indices.push(offset + i * 6 + j + 0);
            indices.push(offset + i * 6 + j + 1);
            indices.push(offset + i * 6 + j + 2);
        }

        positions.push(
            p1[0],
            p1[1],
            EDGE_DEPTH,
            p2[0],
            p2[1],
            EDGE_DEPTH,
            p3[0],
            p3[1],
            CENTER_DEPTH,
            p4[0],
            p4[1],
            CENTER_DEPTH,
            p5[0],
            p5[1],
            EDGE_DEPTH,
            p6[0],
            p6[1],
            EDGE_DEPTH
        );
    }

    return { positions, indices };
}

function calculateJoins(points: Vector2[], radius: number, offset: number = 0) {
    const positions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < points.length; i++) {
        const curr = points[i];
        positions.push(curr[0], curr[1], CENTER_DEPTH);

        for (let j = 0; j < JOINS_SUBDIVISION; j++) {
            const angle = (j / JOINS_SUBDIVISION) * Math.PI * 2;

            const x = points[i][0] + radius * Math.cos(angle);
            const y = points[i][1] + radius * Math.sin(angle);
            const z = EDGE_DEPTH;

            positions.push(x, y, z);
        }

        const indexOffset = offset + i * (JOINS_SUBDIVISION + 1);
        for (let j = 0; j < JOINS_SUBDIVISION; j++) {
            let index1 = 0;
            let index2 = 0 + j + 1;
            let index3 = ((0 + j + 1) % JOINS_SUBDIVISION) + 1;

            index1 += indexOffset;
            index2 += indexOffset;
            index3 += indexOffset;

            indices.push(index1, index2, index3);
        }
    }

    return { positions, indices };
}

function calculateSliderVertices(points: Vector2[], radius: number) {
    let positions: number[] = [];
    let indices: number[] = [];

    const vertX: number[] = [];
    const vertY: number[] = [];

    let indicesOffset = 0;

    const quads = calculateQuad(points, radius, indicesOffset);
    positions.push(...quads.positions);
    indices.push(...quads.indices);

    indicesOffset += positions.length / 3;

    const joins = calculateJoins(points, radius, indicesOffset);
    positions.push(...joins.positions);
    indices.push(...joins.indices);

    for (let i = 0; i < positions.length; i += 2) {
        vertX.push(positions[i]);
        vertY.push(positions[i + 1]);
    }

    const positionBuffer = new Float32Array(positions);
    const indexBuffer = new Uint16Array(indices);

    return { positionBuffer, indexBuffer };
}

function calculateMinMax(positions: Float32Array) {
    let tempMinX = positions[0];
    let tempMaxX = positions[0];
    let tempMinY = positions[1];
    let tempMaxY = positions[1];

    for (let i = 3; i < positions.length; i += 3) {
        if (positions[i] > tempMaxX) {
            tempMaxX = positions[i];
        } else if (positions[i] < tempMinX) {
            tempMinX = positions[i];
        }

        if (positions[i + 1] > tempMaxY) {
            tempMaxY = positions[i + 1];
        } else if (positions[i + 1] < tempMinY) {
            tempMinY = positions[i + 1];
        }
    }

    return [tempMinX, tempMaxX, tempMinY, tempMaxY];
}

class SliderTextureGenerator {
    public static renderer: Renderer;

    static setRenderer = (renderer: Renderer) => {
        SliderTextureGenerator.renderer = renderer;
    };

    static createTexture(points: Vector2[], radius: number) {
        const { positionBuffer, indexBuffer } = calculateSliderVertices(points, radius);

        const [minX, maxX, minY, maxY] = calculateMinMax(positionBuffer);
        const width = maxX - minX;
        const height = maxY - minY;

        const geometry = new Geometry();
        geometry.addAttribute("a_position", positionBuffer, 3);
        geometry.addIndex(indexBuffer);

        const uniform = {
            u_resolution: [width, height],
            u_offset: [-minX, -minY],
        };

        const shader = Shader.from(vertexShaderSource, fragmentShaderSource, uniform);
        const mesh = new Mesh(geometry, shader);
        mesh.state.depthTest = true;

        const texture = RenderTexture.create({ width: width, height: height });
        texture.framebuffer.enableDepth();
        const renderer = this.renderer;

        renderer.render(mesh, { renderTexture: texture });

        return texture;
    }
}

export { SliderTextureGenerator };
