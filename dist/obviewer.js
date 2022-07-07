import * as PIXI from 'pixi.js';
import { Loader, Texture, Geometry, Shader, Mesh, RenderTexture, Container, Graphics, Sprite, TextStyle, Text } from 'pixi.js';
import { Buffer } from 'buffer';

class GameHUD {
    constructor(renderer) {
        this.renderer = renderer;
        renderer.loadHUD(this);
    }
    get time() {
        return this._time;
    }
    set time(time) {
        this._time = time;
    }
}

class GameInstance {
    constructor(renderer) {
        this.renderer = renderer;
        this.gameHUD = new GameHUD(this.renderer);
    }
    get time() {
        return this._time;
    }
    set time(time) {
        this._time = time;
        this.gameHUD.time = time;
        this.draw(time);
    }
    loadBeatmap(beatmap) {
        this.beatmap = beatmap;
    }
    loadReplay(replay) {
        this.replay = replay;
    }
    draw(time) {
        const hitObjects = this.beatmap.hitObjects.objects;
        for (let i = 0; i < hitObjects.length; i++) {
            hitObjects[i].draw(time);
        }
    }
}

var Mod;
(function (Mod) {
    Mod[Mod["None"] = 0] = "None";
    Mod[Mod["NoFail"] = 1] = "NoFail";
    Mod[Mod["Easy"] = 2] = "Easy";
    Mod[Mod["TouchDevice"] = 4] = "TouchDevice";
    Mod[Mod["Hidden"] = 8] = "Hidden";
    Mod[Mod["HardRock"] = 16] = "HardRock";
    Mod[Mod["SuddenDeath"] = 32] = "SuddenDeath";
    Mod[Mod["DoubleTime"] = 64] = "DoubleTime";
    Mod[Mod["Relax"] = 128] = "Relax";
    Mod[Mod["HalfTime"] = 256] = "HalfTime";
    Mod[Mod["Nightcore"] = 512] = "Nightcore";
    Mod[Mod["Flashlight"] = 1024] = "Flashlight";
    Mod[Mod["Autoplay"] = 2048] = "Autoplay";
    Mod[Mod["SpunOut"] = 4096] = "SpunOut";
    Mod[Mod["Relax2"] = 8192] = "Relax2";
    Mod[Mod["Perfect"] = 16384] = "Perfect";
    Mod[Mod["TargetPractice"] = 8388608] = "TargetPractice";
    Mod[Mod["ScoreV2"] = 536870912] = "ScoreV2";
})(Mod || (Mod = {}));
class Mods {
    constructor(value = 0) {
        this.constrain = true;
        this._list = new Array();
        this._numeric = value;
    }
    get reducedListString() {
        let reducedMods = reduceCombinedMods(this._list);
        return reducedMods.map((mod) => Mod[mod]);
    }
    get listString() {
        return this._list.map((mod) => Mod[mod]);
    }
    get reducedList() {
        return reduceCombinedMods(this._list);
    }
    get list() {
        return this._list;
    }
    get numeric() {
        return this._numeric;
    }
    set numeric(value) {
        if (value <= 0) {
            this._numeric = 0;
            this._list = [Mod.None];
            return;
        }
        let result = new Array();
        let sum = 0;
        value
            .toString(2)
            .split("")
            .map(Number)
            .reverse()
            .forEach((currentValue, index) => {
            if (currentValue === 1) {
                result.push(currentValue << index);
                sum += currentValue << index;
            }
        });
        this._numeric = sum;
        this._list = result.reverse();
    }
    contains(arg) {
        if (arg instanceof Array) {
            let result = true;
            for (const mod of arg) {
                if ((mod & this._numeric) !== mod) {
                    result = false;
                    break;
                }
            }
            return result;
        }
        return (arg & this._numeric) === arg;
    }
    set(mod, enable) {
        if (enable) {
            return this.enable(mod);
        }
        else {
            return this.disable(mod);
        }
    }
    _enable(...mods) {
        mods.forEach((mod) => (this.numeric |= mod));
    }
    _disable(...mods) {
        mods.forEach((mod) => (this.numeric ^= this.numeric & mod));
    }
    enable(mod) {
        if (!this.constrain) {
            this._enable(mod);
            return;
        }
        if ([Mod.DoubleTime, Mod.Nightcore, Mod.HalfTime].includes(mod)) {
            this._disable(Mod.DoubleTime, Mod.Nightcore, Mod.HalfTime);
        }
        if ([Mod.Easy, Mod.HardRock].includes(mod)) {
            this._disable(Mod.Easy, Mod.HardRock);
        }
        if ([
            Mod.NoFail,
            Mod.Relax,
            Mod.Relax2,
            Mod.SuddenDeath,
            Mod.Perfect,
        ].includes(mod)) {
            this._disable(Mod.NoFail, Mod.Relax, Mod.Relax2, Mod.SuddenDeath, Mod.Perfect);
            this._disable(Mod.Autoplay);
        }
        if ([Mod.SpunOut, Mod.Relax2].includes(mod)) {
            this._disable(Mod.SpunOut, Mod.Relax2);
        }
        if ([Mod.Autoplay].includes(mod)) {
            this._disable(Mod.NoFail, Mod.Relax, Mod.Relax2, Mod.SuddenDeath, Mod.Perfect);
        }
        if (mod === Mod.Nightcore) {
            this._enable(Mod.DoubleTime);
        }
        if (mod === Mod.Perfect) {
            this._enable(Mod.SuddenDeath);
        }
        this._enable(mod);
        return this;
    }
    disable(mod) {
        if (!this.constrain) {
            this._disable(mod);
            return;
        }
        if (mod === Mod.DoubleTime) {
            this._disable(Mod.Nightcore);
        }
        if (mod === Mod.Nightcore && this.contains(Mod.Nightcore)) {
            this._disable(Mod.DoubleTime);
        }
        if (mod === Mod.SuddenDeath) {
            this._disable(Mod.Perfect);
        }
        if (mod === Mod.Perfect && this.contains(Mod.Perfect)) {
            this._disable(Mod.SuddenDeath);
        }
        this._disable(mod);
        return this;
    }
}
/* Reduce from "[..., Nightcore, DoubleTime]" to [..., Nightcore] */
function reduceCombinedMods(list) {
    const result = [...list];
    // fancy oneliners are bad bro
    if (result.includes(Mod.Nightcore)) {
        const index = result.indexOf(Mod.DoubleTime);
        if (index !== -1) {
            result.splice(index, 1);
        }
    }
    if (result.includes(Mod.Perfect)) {
        const index = result.indexOf(Mod.SuddenDeath);
        if (index !== -1) {
            result.splice(index, 1);
        }
    }
    return result;
}

class AudioHandler {
    constructor() {
        this.loadedAudio = {};
    }
    loadAudio(name, audio, options) {
        const defaultOptions = {
            offsetMS: 0,
            volume: 1,
            playbackRate: 1,
        };
        Object.assign(defaultOptions, options);
        this.loadedAudio[name] = { audio, options: defaultOptions };
        const { playbackRate, offsetMS, volume } = defaultOptions;
        audio.playbackRate = playbackRate !== null && playbackRate !== void 0 ? playbackRate : 1;
        audio.currentTime = offsetMS / 1000;
        audio.volume = volume !== null && volume !== void 0 ? volume : 1.0;
    }
    playAudio(name) {
        const audio = this.loadedAudio[name].audio;
        if (!audio)
            return;
        audio.play();
    }
    pauseAudio(name) {
        const audio = this.loadedAudio[name].audio;
        if (!audio)
            return;
        audio.pause();
    }
    stopAudio(name) {
        const audio = this.loadedAudio[name].audio;
        if (!audio)
            return;
        audio.pause();
        audio.currentTime = this.loadedAudio[name].options.offsetMS / 1000;
    }
    setAudioOptions(name, options) {
        const audio = this.loadedAudio[name].audio;
        if (!audio)
            return;
        const audioOptions = this.loadedAudio[name].options;
        Object.assign(audioOptions, options);
        const { playbackRate, offsetMS, volume } = audioOptions;
        audio.playbackRate = playbackRate !== null && playbackRate !== void 0 ? playbackRate : audio.playbackRate;
        audio.currentTime = audio.currentTime + offsetMS / 1000;
        audio.volume = volume !== null && volume !== void 0 ? volume : audio.volume;
    }
    seekAudio(name, time) {
        const { audio, options } = this.loadedAudio[name];
        if (!audio)
            return;
        const offsetMS = options.offsetMS;
        audio.currentTime = time + offsetMS / 1000;
    }
    getAudioCurrentTimeMS(name) {
        const audio = this.loadedAudio[name].audio;
        if (!audio)
            return 0;
        return audio.currentTime * 1000;
    }
    getAudioOffsetMS(name) {
        const audio = this.loadedAudio[name].audio;
        if (!audio)
            return 0;
        return this.loadedAudio[name].options.offsetMS;
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            }
        }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

// fuck generics
class Settings {
    static addUpdateListener(key, listener) {
        if (this.listeners[key] === undefined) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(listener);
    }
    static removeUpdateListener(key, listener) {
        if (this.listeners[key] === undefined) {
            return;
        }
        const index = this.listeners[key].findIndex((val) => val === listener);
        index > -1 && this.listeners[key].splice(index, 1);
    }
    static set(key, value) {
        if (this._settings[key] === value) {
            return;
        }
        this._settings[key] = value;
        this.notify(key);
    }
    static get(key) {
        return this._settings[key];
    }
    static toString() {
        return JSON.stringify(this._settings);
    }
    static fromString(settings) {
        const keys = Object.keys(this._settings);
        const newSettings = JSON.parse(settings);
        for (const key of keys) {
            if (newSettings[key] === undefined) {
                continue;
            }
            this._settings[key] = newSettings[key];
        }
    }
    static notify(key) {
        if (this.listeners[key] === undefined) {
            return;
        }
        for (let listener of this.listeners[key]) {
            const value = this._settings[key];
            listener(value);
        }
    }
}
Settings._settings = {
    AppWidth: 1280,
    AppHeight: 720,
    AudioVolume: 60,
    AudioOffset: 0,
    AudioAutoSyncEnabled: true,
    AudioAutoSyncThresholdMS: 150,
    AudioAutoSyncDetectIssue: true,
    EnableGameCheck: false,
};
Settings.listeners = {}; // hack mode

var sync = [
	[
		"background",
		"assets/bg.jpg"
	],
	[
		"bg2",
		"assets/bg copy.jpg"
	],
	[
		"girls",
		"assets/girls.png"
	],
	[
		"approachcircle",
		"assets/osu/approachcircle.png"
	],
	[
		"hitcircle",
		"assets/osu/hitcircle.png"
	],
	[
		"hitcircleoverlay",
		"assets/osu/hitcircleoverlay.png"
	],
	[
		"reversearrow",
		"assets/osu/reversearrow.png"
	],
	[
		"sliderb0",
		"assets/osu/sliderb0.png"
	],
	[
		"sliderscorepoint",
		"assets/osu/sliderscorepoint.png"
	],
	[
		"sliderfollowcircle",
		"assets/osu/sliderfollowcircle.png"
	],
	[
		"spinner-background",
		"assets/osu/spinner-background.png"
	],
	[
		"spinner-circle",
		"assets/osu/spinner-circle.png"
	],
	[
		"spinner-clear",
		"assets/osu/spinner-clear.png"
	],
	[
		"spinner-metre",
		"assets/osu/spinner-metre.png"
	],
	[
		"spinner-middle",
		"assets/osu/spinner-middle.png"
	],
	[
		"spinner-spin",
		"assets/osu/spinner-spin.png"
	],
	[
		"main-cursor",
		"assets/osu/cursor.png"
	],
	[
		"cursornode",
		"assets/replay-tale/cursornode.png"
	]
];
var async = [
];
var assetsConfig = {
	sync: sync,
	async: async
};

class AssetsLoader {
    static load() {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadAsync();
            yield this.loadSync();
            for (const key in this.loaderSync.resources) {
                if (this.loaderSync.resources.hasOwnProperty(key)) {
                    const element = this.loaderSync.resources[key];
                    this.assets[key] = element;
                }
            }
            for (const key in this.loaderAsync.resources) {
                if (this.loaderAsync.resources.hasOwnProperty(key)) {
                    const element = this.loaderAsync.resources[key];
                    this.assets[key] = element;
                }
            }
        });
    }
    static loadSync() {
        return __awaiter(this, void 0, void 0, function* () {
            const loader = new Promise((resolve, reject) => {
                this.loaderSync.onComplete.add(resolve);
                this.loaderSync.onError.add(reject);
                this.loaderSync.load();
            });
            yield loader;
        });
    }
    static loadAsync() {
        this.loaderAsync.load();
    }
    static _getCachedTexture(name) {
        return this._cachedTextures[name];
    }
    static _setCachedTexture(name, texture) {
        this._cachedTextures[name] = texture;
    }
    // utils.TextureCache is kinda fucky
    static getTexture(name) {
        const cached = this._getCachedTexture(name);
        if (!cached || !cached.valid) {
            const texture = (this.assets[name].texture || Texture.EMPTY).clone();
            this._setCachedTexture(name, texture);
        }
        return this._getCachedTexture(name);
    }
}
AssetsLoader.assets = {};
AssetsLoader._cachedTextures = {};
AssetsLoader._staticConstructor = (function () {
    AssetsLoader.loaderSync = new Loader();
    AssetsLoader.loaderAsync = new Loader();
    const assetsData = assetsConfig;
    const syncData = assetsData.sync;
    syncData.forEach((data) => {
        const [assetsName, assetsPath] = data;
        AssetsLoader.loaderSync.add(assetsName, assetsPath);
    });
    AssetsLoader.loaderSync.onStart.add(() => {
        console.log("[Assets Loader] Sync Loader - Start");
    });
    AssetsLoader.loaderSync.onComplete.add(() => {
        console.log("[Assets Loader] Sync Loader - Completed");
    });
    AssetsLoader.loaderAsync.onStart.add(() => {
        console.log("[Assets Loader] Async Loader - Start");
    });
    AssetsLoader.loaderAsync.onComplete.add(() => {
        console.log("[Assets Loader] Async Loader - Completed");
    });
})();

class Vector2 {
    constructor(x, y) {
        this.add = (valueOrVector) => {
            if (typeof valueOrVector === "number") {
                return new Vector2(this[0] + valueOrVector, this[1] + valueOrVector);
            }
            return new Vector2(this[0] + valueOrVector[0], this[1] + valueOrVector[1]);
        };
        this.subtract = (valueOrVector) => {
            if (typeof valueOrVector === "number") {
                return new Vector2(this[0] - valueOrVector, this[1] - valueOrVector);
            }
            return new Vector2(this[0] - valueOrVector[0], this[1] - valueOrVector[1]);
        };
        this.multiply = (scalar) => {
            return new Vector2(this[0] * scalar, this[1] * scalar);
        };
        if (typeof x === "number" && y !== undefined) {
            this[0] = x;
            this[1] = y;
        }
        else if (x instanceof Array) {
            this[0] = x[0];
            this[1] = x[1];
        }
    }
    lengthSquared() {
        return Math.pow(this[0], 2) + Math.pow(this[1], 2);
    }
    length() {
        return Math.sqrt(this.lengthSquared());
    }
    dot(vector) {
        return Math.min(this[0] * vector[0] + this[1] * vector[1], 1);
    }
    normalize() {
        return new Vector2([this[0] / this.length(), this[1] / this.length()]);
    }
    toArray() {
        return [this[0], this[1]];
    }
    toTuple() {
        return [this[0], this[1]];
    }
    rotate(angle) {
        return new Vector2(this[0] * Math.cos(angle) - this[1] * Math.sin(angle), this[0] * Math.sin(angle) + this[1] * Math.cos(angle));
    }
    clone() {
        return new Vector2(this[0], this[1]);
    }
    static From(numberOrArray, y) {
        if (numberOrArray instanceof Array) {
            return new Vector2(numberOrArray[0], numberOrArray[1]);
        }
        return new Vector2(numberOrArray, y); // typescript bruh moment
    }
    static ToArray(vector) {
        return [vector[0], vector[1]];
    }
    static Normalize(vector) {
        return new Vector2(vector[0] / Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2)), vector[1] / Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2)));
    }
    static PerpendicularRight(vector) {
        return new Vector2(-vector[1], vector[0]);
    }
    static PerpendicularLeft(vector) {
        return new Vector2(vector[1], -vector[0]);
    }
    static Add(vector1, vector2OrValue) {
        if (typeof vector2OrValue === "number") {
            return new Vector2(vector1[0] + vector2OrValue, vector1[1] + vector2OrValue);
        }
        return new Vector2(vector1[0] + vector2OrValue[0], vector1[1] + vector2OrValue[1]);
    }
    static Subtract(vector1, vector2OrValue) {
        if (typeof vector2OrValue === "number") {
            return new Vector2(vector1[0] - vector2OrValue, vector1[1] - vector2OrValue);
        }
        return new Vector2(vector1[0] - vector2OrValue[0], vector1[1] - vector2OrValue[1]);
    }
    static Multiply(vector, scalar) {
        return new Vector2(vector[0] * scalar, vector[1] * scalar);
    }
    static DistanceSquared(vector1, vector2) {
        return Math.pow(vector1[0] - vector2[0], 2) + Math.pow(vector1[1] - vector2[1], 2);
    }
    static Distance(vector1, vector2) {
        return Math.sqrt(this.DistanceSquared(vector1, vector2));
    }
    static LengthSquared(vector) {
        return Math.pow(vector[0], 2) + Math.pow(vector[1], 2);
    }
    static Length(vector) {
        return Math.sqrt(this.LengthSquared(vector));
    }
    static Midpoint(vector1, vector2) {
        return new Vector2((vector1[0] + vector2[0]) / 2, (vector1[1] + vector2[1]) / 2);
    }
    static Dot(vector1, vector2) {
        return Math.min(vector1[0] * vector2[0] + vector1[1] * vector2[1], 1);
    }
    static Equals(vector1, vector2) {
        return vector1[0] === vector2[0] && vector1[1] === vector2[1];
    }
    static LinearInterpolation(vector1, vector2, t) {
        return new Vector2(vector1[0] + (vector2[0] - vector1[0]) * t, vector1[1] + (vector2[1] - vector1[1]) * t);
    }
    static CloseEnough(vector1, vector2, epsilon) {
        return Math.abs(vector1[0] - vector2[0]) < epsilon && Math.abs(vector1[1] - vector2[1]) < epsilon;
    }
    static Angle(from, to) {
        return Math.atan2(to[1] - from[1], to[0] - from[0]);
    }
}

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
function calculateQuad(points, radius, offset = 0) {
    const positions = [];
    const indices = [];
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
        positions.push(p1[0], p1[1], EDGE_DEPTH, p2[0], p2[1], EDGE_DEPTH, p3[0], p3[1], CENTER_DEPTH, p4[0], p4[1], CENTER_DEPTH, p5[0], p5[1], EDGE_DEPTH, p6[0], p6[1], EDGE_DEPTH);
    }
    return { positions, indices };
}
function calculateJoins(points, radius, offset = 0) {
    const positions = [];
    const indices = [];
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
function calculateSliderVertices(points, radius) {
    let positions = [];
    let indices = [];
    const vertX = [];
    const vertY = [];
    let indicesOffset = 0;
    const quads = calculateQuad(points, radius, indicesOffset);
    positions = positions.concat(quads.positions);
    indices = indices.concat(quads.indices);
    indicesOffset += positions.length / 3;
    const joins = calculateJoins(points, radius, indicesOffset);
    positions = positions.concat(joins.positions);
    indices = indices.concat(joins.indices);
    for (let i = 0; i < positions.length; i += 2) {
        vertX.push(positions[i]);
        vertY.push(positions[i + 1]);
    }
    const positionBuffer = new Float32Array(positions);
    const indexBuffer = new Uint16Array(indices);
    return { positionBuffer, indexBuffer };
}
function calculateMinMax(positions) {
    let tempMinX = positions[0];
    let tempMaxX = positions[0];
    let tempMinY = positions[1];
    let tempMaxY = positions[1];
    for (let i = 3; i < positions.length; i += 3) {
        if (positions[i] > tempMaxX) {
            tempMaxX = positions[i];
        }
        else if (positions[i] < tempMinX) {
            tempMinX = positions[i];
        }
        if (positions[i + 1] > tempMaxY) {
            tempMaxY = positions[i + 1];
        }
        else if (positions[i + 1] < tempMinY) {
            tempMinY = positions[i + 1];
        }
    }
    return [tempMinX, tempMaxX, tempMinY, tempMaxY];
}
class SliderTextureGenerator {
    static createTexture(points, radius) {
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
SliderTextureGenerator.setRenderer = (renderer) => {
    SliderTextureGenerator.renderer = renderer;
};

class Background extends Container {
    constructor(application, backgroundConfig) {
        super();
        this.application = application;
        this.blackRect = new Graphics();
        this.backgroundSprite = new Sprite();
        this._brightness = 1;
        this.fit = "none";
        this.blackRect.beginFill(0x000000);
        this.blackRect.drawRect(0, 0, this.canvasWidth, this.canvasHeight);
        const bgAnchorX = this.canvasWidth / 2;
        const bgAnchorY = this.canvasHeight / 2;
        this.backgroundSprite.transform.position.set(bgAnchorX, bgAnchorY);
        this.backgroundSprite.anchor.set(0.5, 0.5);
        this.addChild(this.blackRect);
        this.addChild(this.backgroundSprite);
        if (!backgroundConfig)
            return;
        const { texture, brightness, fit } = backgroundConfig;
        this._brightness = brightness !== null && brightness !== void 0 ? brightness : 1;
        fit && (this.fit = fit);
        texture && this.setImage(texture);
    }
    get brightness() {
        return this._brightness;
    }
    set brightness(brightnessValue) {
        if (brightnessValue > 1) {
            this._brightness = 1;
        }
        else if (brightnessValue < 0) {
            this._brightness = 0;
        }
        else {
            this._brightness = brightnessValue;
        }
        this.backgroundSprite.alpha = this.brightness;
    }
    get canvasWidth() {
        return this.application.view.width;
    }
    get canvasHeight() {
        return this.application.view.height;
    }
    setImage(texture) {
        this.backgroundSprite.alpha = this.brightness;
        this.backgroundSprite.texture = texture;
        switch (this.fit) {
            case "horizontal": {
                const scale = this.canvasWidth / texture.width;
                this.backgroundSprite.scale.set(scale);
                break;
            }
            case "vertical": {
                const scale = this.canvasHeight / texture.height;
                this.backgroundSprite.scale.set(scale);
                break;
            }
        }
    }
    draw(timestamp) { }
}

function getOsuPixelScale(screenWidth, screenHeight) {
    const widthRatio = screenWidth / 512;
    const heightRatio = screenHeight / 384;
    return Math.min(widthRatio, heightRatio);
}
function calculateFitRatio(fromWidth, fromHeight, toWidth, toHeight) {
    const widthRatio = fromWidth / toWidth;
    const heightRatio = fromHeight / toHeight;
    return Math.min(widthRatio, heightRatio);
}

function hexToInt(hex) {
    if (hex.charAt(0) === "#") {
        hex = hex.slice(1);
    }
    if (hex.length != 6) {
        return NaN;
    }
    return parseInt(hex, 16);
}

function createCircle(hitCircle, radius) {
    const { comboCount, colour } = hitCircle;
    const texture = AssetsLoader.getTexture("hitcircle");
    const hitCircleSprite = new Sprite(texture);
    hitCircleSprite.width = radius * 2;
    hitCircleSprite.height = radius * 2;
    hitCircleSprite.tint = hexToInt(colour);
    hitCircleSprite.anchor.set(0.5, 0.5);
    const hcOverlayTexture = AssetsLoader.getTexture("hitcircleoverlay");
    const sHCOverlay = new Sprite(hcOverlayTexture);
    sHCOverlay.width = radius * 2;
    sHCOverlay.height = radius * 2;
    sHCOverlay.anchor.set(0.5, 0.5);
    const style = new TextStyle({
        fill: "white",
        fontSize: (radius * 4) / 5,
        strokeThickness: 3,
    });
    const circleNumber = new Text(comboCount.toString(), style);
    circleNumber.anchor.set(0.5, 0.5);
    const circle = new Container();
    circle.addChild(hitCircleSprite);
    circle.addChild(sHCOverlay);
    circle.addChild(circleNumber);
    circle.alpha = 0.8;
    return circle;
}
function createApproachCircle$1(radius) {
    const texture = AssetsLoader.getTexture("approachcircle");
    const ac = new Sprite(texture);
    ac.width = radius * 2;
    ac.height = radius * 2;
    ac.anchor.set(0.5, 0.5);
    return ac;
}
class DrawableHitCircle$1 extends Container {
    constructor(hitCircle, renderScale) {
        super();
        this.hitCircle = hitCircle;
        const startPos = hitCircle.getStackedStartPos();
        const x = startPos[0] * renderScale;
        const y = startPos[1] * renderScale;
        this.origin = [x, y];
        this.radius = hitCircle.difficulty.getObjectRadius() * renderScale;
        this.circle = createCircle(hitCircle, this.radius);
        this.approachCircle = createApproachCircle$1(this.radius);
        this.addChild(this.circle);
        this.addChild(this.approachCircle);
        this.position.set(x, y);
        this.visible = false;
    }
    draw(timestamp) {
        const visible = this.hitCircle.isVisibleAt(timestamp);
        this.visible = visible;
        if (!visible)
            return;
        const { opacity, scale, approachCircleScale, approachCircleOpacity, positionOffset } = this.hitCircle.drawable;
        this.circle.alpha = opacity.value;
        this.circle.scale.set(scale.value);
        this.approachCircle.alpha = approachCircleOpacity.value;
        this.approachCircle.width = approachCircleScale.value * this.radius * 2;
        this.approachCircle.height = approachCircleScale.value * this.radius * 2;
        this.position.x = this.origin[0] + positionOffset.x.value;
        this.position.y = this.origin[1] + positionOffset.y.value;
    }
}

function createSliderBody(path, radius) {
    const points = path.points;
    let minPoint = [points[0][0], points[0][1]];
    for (let i = 1; i < points.length; i++) {
        if (points[i][0] < minPoint[0])
            minPoint[0] = points[i][0];
        if (points[i][1] < minPoint[1])
            minPoint[1] = points[i][1];
    }
    minPoint[0] -= radius;
    minPoint[1] -= radius;
    const texture = SliderTextureGenerator.createTexture(path.points, radius);
    const sprite = new Sprite(texture);
    sprite.position.set(minPoint[0], minPoint[1]);
    sprite.alpha = 0.8;
    return sprite;
}
function createSliderHead(slider, radius) {
    const color = hexToInt(slider.colour);
    const count = slider.comboCount;
    const hitTexture = AssetsLoader.getTexture("hitcircle");
    const hitSprite = new Sprite(hitTexture);
    hitSprite.tint = color;
    hitSprite.width = Math.ceil(radius * 2);
    hitSprite.height = Math.ceil(radius * 2);
    hitSprite.anchor.set(0.5);
    const overlayTexture = AssetsLoader.getTexture("hitcircleoverlay");
    const overlaySprite = new Sprite(overlayTexture);
    overlaySprite.width = Math.ceil(radius * 2);
    overlaySprite.height = Math.ceil(radius * 2);
    overlaySprite.anchor.set(0.5, 0.5);
    const style = new TextStyle({
        fill: "white",
        fontSize: (radius * 4) / 5,
        strokeThickness: 3,
    });
    const number = new Text(count.toString(), style);
    number.anchor.set(0.5, 0.5);
    const sliderHead = new Container();
    sliderHead.addChild(hitSprite);
    sliderHead.addChild(overlaySprite);
    sliderHead.addChild(number);
    return sliderHead;
}
function createSliderBall(radius) {
    const texture = AssetsLoader.getTexture("sliderb0");
    const sliderBall = new Sprite(texture);
    sliderBall.anchor.set(0.5, 0.5);
    sliderBall.width = radius * 2;
    sliderBall.height = radius * 2;
    sliderBall.alpha = 0;
    return sliderBall;
}
function createSliderFollower(radius) {
    const texture = AssetsLoader.getTexture("sliderfollowcircle");
    const sliderFollower = new Sprite(texture);
    sliderFollower.anchor.set(0.5, 0.5);
    sliderFollower.width = radius * 2;
    sliderFollower.height = radius * 2;
    sliderFollower.alpha = 0;
    return sliderFollower;
}
function createApproachCircle(radius) {
    const texture = AssetsLoader.getTexture("approachcircle");
    const approachCircle = new Sprite(texture);
    approachCircle.width = radius * 2;
    approachCircle.height = radius * 2;
    approachCircle.anchor.set(0.5, 0.5);
    return approachCircle;
}
function createSliderReverses(slider, radius) {
    const stackedSliderReverses = slider.getStackedReverseTicks();
    const sliderReverses = new Container();
    const renderScale = radius / slider.difficulty.getObjectRadius();
    for (const sliderReverse of stackedSliderReverses) {
        const reverseTexture = AssetsLoader.getTexture("reversearrow");
        const reverse = new Sprite(reverseTexture);
        reverse.width = radius * 2;
        reverse.height = radius * 2;
        reverse.anchor.set(0.5);
        const relativePos = [
            (sliderReverse.position[0] - slider.startPos[0]) * renderScale,
            (sliderReverse.position[1] - slider.startPos[1]) * renderScale,
        ];
        reverse.position.set(relativePos[0], relativePos[1]);
        reverse.rotation = sliderReverse.isReversed ? slider.endAngle : slider.startAngle;
        sliderReverses.addChild(reverse);
    }
    return sliderReverses;
}
function createSliderTicks(slider, radius) {
    const stackedSliderTicks = slider.getStackedSliderTicks();
    const tickTexture = AssetsLoader.getTexture("sliderscorepoint");
    const renderScale = radius / slider.difficulty.getObjectRadius();
    const sliderTicks = new Container();
    for (const sliderTick of stackedSliderTicks) {
        const tick = new Sprite(tickTexture);
        tick.anchor.set(0.5, 0.5);
        const relativeTickPos = [
            (sliderTick.position[0] - slider.getStackedStartPos()[0]) * renderScale,
            (sliderTick.position[1] - slider.getStackedStartPos()[1]) * renderScale,
        ];
        tick.position.set(relativeTickPos[0], relativeTickPos[1]);
        sliderTicks.addChild(tick);
    }
    return sliderTicks;
}
class DrawableSlider$1 extends Container {
    constructor(slider, renderScale) {
        super();
        this.slider = slider;
        this.renderScale = renderScale;
        const startPos = slider.getStackedStartPos();
        const x = startPos[0] * renderScale;
        const y = startPos[1] * renderScale;
        this.linePath = slider.getStackedCurvePath();
        this.radius = slider.difficulty.getObjectRadius() * renderScale;
        this.linePath.scale(renderScale);
        this.linePath.translate(-this.linePath.points[0][0], -this.linePath.points[0][1]);
        this.sliderApproachCircle = createApproachCircle(this.radius);
        this.sliderBody = createSliderBody(this.linePath, this.radius);
        this.sliderHead = createSliderHead(this.slider, this.radius);
        this.sliderBall = createSliderBall(this.radius);
        this.sliderFollower = createSliderFollower(this.radius);
        this.sliderReverses = createSliderReverses(this.slider, this.radius);
        this.sliderTicks = createSliderTicks(this.slider, this.radius);
        this.addChild(this.sliderBody);
        this.addChild(this.sliderTicks);
        this.addChild(this.sliderReverses);
        this.addChild(this.sliderBall);
        this.addChild(this.sliderFollower);
        this.addChild(this.sliderHead);
        this.addChild(this.sliderApproachCircle);
        this.position.set(x, y);
        this.visible = false;
    }
    draw(timestamp) {
        const visible = this.slider.isVisibleAt(timestamp);
        this.visible = visible;
        if (!visible)
            return;
        const { progressPosition, bodyOpacity, headOpacity, ballOpacity, approachCircleOpacity, approachCircleScale, followCircleOpacity, followCircleScale, } = this.slider.drawable;
        this.sliderBody.alpha = bodyOpacity.value;
        this.sliderHead.alpha = headOpacity.value;
        this.sliderApproachCircle.alpha = approachCircleOpacity.value;
        this.sliderApproachCircle.width = approachCircleScale.value * this.radius * 2;
        this.sliderApproachCircle.height = approachCircleScale.value * this.radius * 2;
        const ballPos = [
            (progressPosition[0] - this.slider.getStackedStartPos()[0]) * this.renderScale,
            (progressPosition[1] - this.slider.getStackedStartPos()[1]) * this.renderScale,
        ];
        this.sliderBall.transform.position.set(ballPos[0], ballPos[1]);
        this.sliderBall.alpha = ballOpacity.value;
        this.sliderFollower.transform.position.set(ballPos[0], ballPos[1]);
        this.sliderFollower.alpha = followCircleOpacity.value;
        this.sliderFollower.scale.set(followCircleScale.value);
        for (let i = 0; i < this.slider.reverseTicks.length; i++) {
            const reverseTick = this.slider.reverseTicks[i];
            const opacity = reverseTick.drawable.opacity.value;
            const scale = reverseTick.drawable.scale.value;
            this.sliderReverses.children[i].alpha = opacity;
            this.sliderReverses.children[i].scale.set(scale);
        }
        for (let i = 0; i < this.slider.sliderTicks.length; i++) {
            const sliderTick = this.slider.sliderTicks[i];
            const opacity = sliderTick.drawable.opacity.value;
            const scale = sliderTick.drawable.scale.value;
            this.sliderTicks.children[i].alpha = opacity;
            this.sliderTicks.children[i].scale.set(scale);
        }
    }
}

const NODE_SCALE = 0.1;
const NODE_COUNT_AFTER = 0;
const NODE_COUNT_BEFORE = 0;
function createCursorNodes(size) {
    const nodeSprites = [];
    for (let i = 0; i < NODE_COUNT_BEFORE + NODE_COUNT_AFTER + 1; i++) {
        const texture = AssetsLoader.getTexture("cursornode");
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(size);
        nodeSprites.push(sprite);
    }
    return nodeSprites;
}
class CursorNode extends Container {
    constructor(replay, renderScale) {
        super();
        this.replay = replay;
        this.renderScale = renderScale;
        this.nodeSprites = createCursorNodes(renderScale * NODE_SCALE);
        this.nodeLine = new Graphics();
        this.addChild(this.nodeLine);
        this.nodeSprites.forEach((nodeSprite) => this.addChild(nodeSprite));
        this.visible = true;
    }
    draw(timestamp) {
        const index = this.replay.replayData.getIndexNear(timestamp);
        const indexStart = Math.max(0, index - NODE_COUNT_BEFORE);
        const indexEnd = Math.min(this.replay.replayData.length - 1, index + NODE_COUNT_AFTER);
        const count = indexEnd - indexStart + 1;
        for (let i = indexStart; i <= indexEnd; i++) {
            const node = this.replay.replayData[i];
            const nodeSprite = this.nodeSprites[i - indexStart];
            let alpha = 1 - (Math.abs(index - i) / count) * 2;
            if (node.isPressing("K1") || node.isPressing("M1")) {
                nodeSprite.tint = 0xffff00;
            }
            else if (node.isPressing("K2") || node.isPressing("M2")) {
                nodeSprite.tint = 0xff00ff;
            }
            else {
                nodeSprite.tint = 0xffffff;
                nodeSprite.scale.set(this.renderScale * NODE_SCALE);
            }
            nodeSprite.alpha = alpha;
            nodeSprite.position.set(node.x * this.renderScale, node.y * this.renderScale);
        }
        const line = this.nodeLine;
        line.clear();
        line.lineStyle({ color: 0xffffff, width: 2 * this.renderScale });
        for (let i = 0; i < count - 1; i++) {
            const curr = this.nodeSprites[i];
            const next = this.nodeSprites[i + 1];
            const startPos = [curr.x, curr.y];
            const endPos = [next.x, next.y];
            line.lineStyle({
                color: 0xffffff,
                width: 2 * this.renderScale,
                alpha: 1 - (Math.abs(i - count / 2) / count) * 2,
            });
            line.moveTo(startPos[0], startPos[1]).lineTo(endPos[0], endPos[1]);
        }
    }
}

const CURSOR_SCALE = 70;
function createMainCursor(size) {
    const texture = AssetsLoader.getTexture("main-cursor");
    const mainCursor = new Sprite(texture);
    mainCursor.width = size;
    mainCursor.height = size;
    mainCursor.anchor.set(0.5);
    return mainCursor;
}
class MainCursor extends Container {
    constructor(replay, renderScale) {
        super();
        this.replay = replay;
        this.renderScale = renderScale;
        const x = replay.replayData[0].x * renderScale;
        const y = replay.replayData[0].y * renderScale;
        this.mainCursor = createMainCursor(renderScale * CURSOR_SCALE);
        this.addChild(this.mainCursor);
        this.alpha = 1.0;
        this.position.set(x, y);
    }
    draw(timestamp) {
        const [x, y] = this.replay.replayData.getPositionAt(timestamp, true);
        this.position.set(x * this.renderScale, y * this.renderScale);
    }
}

class Grid extends Graphics {
    constructor(width, height, gridSize, color, alpha) {
        super();
        let cellSize = 4;
        switch (gridSize) {
            case "PIXEL":
                cellSize = 1;
                break;
            case "TINY":
                cellSize = 4;
                break;
            case "SMALL":
                cellSize = 8;
                break;
            case "MEDIUM":
                cellSize = 16;
                break;
            case "LARGE":
                cellSize = 32;
                break;
        }
        const horizontalScale = width / 512;
        const verticalScale = height / 384;
        const scale = Math.min(horizontalScale, verticalScale);
        cellSize *= scale;
        const horizontalGridCount = Math.floor(width / cellSize);
        const verticalGridCount = Math.floor(height / cellSize);
        // use line to draw the grid
        this.lineStyle(1, color, alpha);
        for (let i = 0; i <= horizontalGridCount; i++) {
            this.moveTo(i * cellSize, 0);
            this.lineTo(i * cellSize, height);
        }
        for (let i = 0; i <= verticalGridCount; i++) {
            this.moveTo(0, i * cellSize);
            this.lineTo(width, i * cellSize);
        }
        // create center horizontal and vertical bold line
        this.lineStyle(2, color, alpha);
        this.moveTo(width / 2, 0);
        this.lineTo(width / 2, height);
        this.moveTo(0, height / 2);
        this.lineTo(width, height / 2);
        this.endFill();
    }
}

// the ultimate hack of all time
const SPINNER_BACKGROUND_SCALE = 1.05;
const SPINNER_CIRCLE_SCALE = 0.8;
const SPINNER_SPIN_SCALE = 0.175;
function createSpinnerBackground(renderScale) {
    const texture = AssetsLoader.getTexture("spinner-background");
    const playfieldWidth = 512 * renderScale;
    const playfieldHeight = 384 * renderScale;
    const ratio = SPINNER_BACKGROUND_SCALE * (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));
    const sprite = new Sprite(texture);
    sprite.scale.set(ratio);
    sprite.position.set(playfieldWidth / 2, playfieldHeight / 2);
    sprite.anchor.set(0.5);
    return sprite;
}
function createSpinnerMeter(renderScale) {
    const texture = AssetsLoader.getTexture("spinner-metre");
    const playfieldWidth = 512 * renderScale;
    const playfieldHeight = 384 * renderScale;
    const ratio = SPINNER_BACKGROUND_SCALE * (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));
    const sprite = new Sprite(texture);
    sprite.scale.set(ratio);
    sprite.position.set(playfieldWidth / 2, playfieldHeight / 2);
    sprite.anchor.set(0.5);
    return sprite;
}
function createSpinnerMeterMask(renderScale) {
    const texture = AssetsLoader.getTexture("spinner-metre");
    const playfieldWidth = 512 * renderScale;
    const playfieldHeight = 384 * renderScale;
    const ratio = SPINNER_BACKGROUND_SCALE * (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));
    const mask = new Sprite(Texture.WHITE);
    mask.y = 0;
    mask.x = 0;
    mask.width = texture.width * ratio;
    mask.height = texture.height * ratio;
    mask.position.set(playfieldWidth / 2, playfieldHeight);
    mask.anchor.set(0.5, 1.0);
    return mask;
}
function createSpinnerCircle(renderScale) {
    const texture = AssetsLoader.getTexture("spinner-circle");
    const playfieldWidth = 512 * renderScale;
    const playfieldHeight = 384 * renderScale;
    const ratio = SPINNER_CIRCLE_SCALE * (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));
    const sprite = new Sprite(texture);
    sprite.scale.set(ratio);
    sprite.position.set(playfieldWidth / 2, playfieldHeight / 2);
    sprite.anchor.set(0.5);
    return sprite;
}
function createSpinnerCounter(renderScale) {
    const style = new TextStyle({
        fill: "white",
        fontFamily: "Comic Sans MS",
        fontSize: 18 * renderScale,
        fontWeight: "600",
        lineJoin: "round",
        strokeThickness: 7,
    });
    const text = new Text("0 RPM", style);
    const playfieldWidth = 512 * renderScale;
    const playfieldHeight = 384 * renderScale;
    text.position.set(playfieldWidth / 2, playfieldHeight);
    text.anchor.set(0.5, 1.0);
    return text;
}
function createSpinnerSpin(renderScale) {
    const texture = AssetsLoader.getTexture("spinner-spin");
    const playfieldWidth = 512 * renderScale;
    const playfieldHeight = 384 * renderScale;
    const ratio = SPINNER_SPIN_SCALE * (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));
    const sprite = new Sprite(texture);
    sprite.scale.set(ratio);
    sprite.position.set(playfieldWidth / 2, (playfieldHeight * 3) / 4);
    sprite.anchor.set(0.5, 0.25);
    return sprite;
}
class DrawableSpinner$1 extends Container {
    constructor(spinner, renderScale) {
        super();
        this.spinner = spinner;
        this.spinnerBackground = createSpinnerBackground(renderScale);
        this.spinnerMeter = createSpinnerMeter(renderScale);
        this.spinnerCircle = createSpinnerCircle(renderScale);
        this.spinnerSpin = createSpinnerSpin(renderScale);
        this.spinnerCounter = createSpinnerCounter(renderScale);
        this.spinnerMeterMask = createSpinnerMeterMask(renderScale);
        this.spinnerMeter.mask = this.spinnerMeterMask;
        this.addChild(this.spinnerMeterMask);
        this.addChild(this.spinnerBackground);
        this.addChild(this.spinnerMeter);
        this.addChild(this.spinnerCircle);
        this.addChild(this.spinnerSpin);
        this.addChild(this.spinnerCounter);
        this.visible = false;
    }
    draw(timestamp) {
        const visible = this.spinner.isVisibleAt(timestamp);
        this.visible = visible;
        if (!visible)
            return;
        const { opacity, rotation, meter, rpm } = this.spinner.drawable;
        this.alpha = opacity.value;
        this.spinnerMeterMask.height = this.spinnerBackground.height * Math.min(Math.abs(meter), 1);
        this.spinnerCircle.rotation = rotation;
        this.spinnerCounter.text = `${Math.round(rpm)} RPM`;
    }
}

class DrawableGenerator {
    static CreateGrid(width, height, gridSize, color, alpha) {
        return new Grid(width, height, gridSize, color, alpha);
    }
    static CreateHitObject(hitObject, renderScale) {
        if (hitObject.isHitCircle()) {
            return new DrawableHitCircle$1(hitObject, renderScale);
        }
        else if (hitObject.isSlider()) {
            return new DrawableSlider$1(hitObject, renderScale);
        }
        else {
            return new DrawableSpinner$1(hitObject, renderScale);
        }
    }
}

class BeatmapField extends Container {
    constructor(application) {
        super();
        this.application = application;
        this.hitObjectDrawables = [];
        const canvasWidth = this.application.view.width;
        const canvasHeight = this.application.view.height;
        const playfieldScale = 4 / 5;
        // create full 4:3 out of canvas playfieldResolution above
        if (canvasHeight > (canvasWidth / 4) * 3) {
            this.playfieldResolution = [canvasWidth * playfieldScale, (canvasWidth / 4) * 3 * playfieldScale];
        }
        else {
            this.playfieldResolution = [(canvasHeight / 3) * 4 * playfieldScale, canvasHeight * playfieldScale];
        }
        // center playfield
        const translateX = (canvasWidth - this.playfieldResolution[0]) / 2;
        const translateY = (canvasHeight - this.playfieldResolution[1]) / 2;
        const grid = DrawableGenerator.CreateGrid(this.playfieldResolution[0], this.playfieldResolution[1], "LARGE", 0xffffff, 0.25);
        this.addChild(grid);
        this.position.set(translateX, translateY);
    }
    loadBeatmap(beatmap) {
        this.hitObjectDrawables.forEach((obj) => obj.destroy({ texture: true, baseTexture: false, children: true }));
        this.hitObjectDrawables = [];
        this.beatmap = beatmap;
        const hitObjects = this.beatmap.hitObjects;
        const scale = getOsuPixelScale(this.playfieldResolution[0], this.playfieldResolution[1]);
        hitObjects.objects.forEach((hitObject) => {
            const drawable = DrawableGenerator.CreateHitObject(hitObject, scale);
            this.hitObjectDrawables.push(drawable);
        });
        const objectCount = this.hitObjectDrawables.length;
        for (let i = objectCount - 1; i >= 0; i--) {
            this.addChild(this.hitObjectDrawables[i]);
        }
    }
    draw(timestamp) {
        for (let i = 0; i < this.hitObjectDrawables.length; i++) {
            // would it be nice just to update some instead of all of them ?
            this.hitObjectDrawables[i].draw(timestamp);
        }
    }
}

class HUDOverlay extends Container {
    constructor(application) {
        super();
        this.application = application;
        this.drawProperty = {};
        this.drawProperty = {
            resolution: [this.application.view.width, this.application.view.height],
            scale: getOsuPixelScale(this.application.view.width, this.application.view.height),
        };
    }
    loadBeatmap(beatmap) { }
    loadHUD(gameHUD) { }
    draw(time) { }
}

class ReplayField extends Container {
    constructor(application) {
        super();
        this.application = application;
        const canvasWidth = this.application.view.width;
        const canvasHeight = this.application.view.height;
        const playfieldScale = 4 / 5;
        // create full 4:3 out of canvas playfieldResolution above
        if (canvasHeight > (canvasWidth / 4) * 3) {
            this.playfieldResolution = [canvasWidth * playfieldScale, (canvasWidth / 4) * 3 * playfieldScale];
        }
        else {
            this.playfieldResolution = [(canvasHeight / 3) * 4 * playfieldScale, canvasHeight * playfieldScale];
        }
        // center playfield
        const translateX = (canvasWidth - this.playfieldResolution[0]) / 2;
        const translateY = (canvasHeight - this.playfieldResolution[1]) / 2;
        this.position.set(translateX, translateY);
    }
    loadReplay(replay) {
        const scale = getOsuPixelScale(this.playfieldResolution[0], this.playfieldResolution[1]);
        this.mainCursor = new MainCursor(replay, scale);
        this.cursorNode = new CursorNode(replay, scale);
        this.addChild(this.cursorNode);
        this.addChild(this.mainCursor);
    }
    draw(timestamp) {
        this.mainCursor.draw(timestamp);
        this.cursorNode.draw(timestamp);
    }
}

class Renderer {
    constructor(querySelector) {
        this._timestamp = 0;
        // Set PIXI Application
        this.pixi = new PIXI.Application({
            powerPreference: "high-performance",
            antialias: true,
            width: Settings.get("AppWidth"),
            height: Settings.get("AppHeight"),
            backgroundColor: 0xffffff,
        });
        // Set PIXI Shared Ticker
        this.ticker = PIXI.Ticker.shared;
        this.ticker.autoStart = false;
        this.ticker.stop();
        // Set TextureRenderer Renderer
        SliderTextureGenerator.setRenderer(this.pixi.renderer);
        // Set Background
        this.background = new Background(this.pixi, { brightness: 0.25, fit: "horizontal" });
        this.background.interactiveChildren = false;
        this.pixi.stage.addChild(this.background);
        // Set BeatmapField
        this.beatmapField = new BeatmapField(this.pixi);
        this.beatmapField.interactiveChildren = false;
        this.pixi.stage.addChild(this.beatmapField);
        // Set ReplayField
        this.replayField = new ReplayField(this.pixi);
        this.replayField.interactiveChildren = false;
        this.pixi.stage.addChild(this.replayField);
        // Set HUDOverlay
        this.hudOverlay = new HUDOverlay(this.pixi);
        this.hudOverlay.interactiveChildren = false;
        this.pixi.stage.addChild(this.hudOverlay);
        const view = document.querySelector(querySelector);
        view && view.appendChild(this.pixi.view);
        // Initialize App
        this.init();
    }
    get timestamp() {
        return this._timestamp;
    }
    set timestamp(time) {
        this._timestamp = time;
        this.ticker.update(time);
        this.background.draw(time);
        this.beatmapField.draw(time);
        this.replayField.draw(time);
        this.hudOverlay.draw(time);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Load Assets
            yield AssetsLoader.load();
            this.assets = AssetsLoader.assets;
        });
    }
    loadBeatmap(beatmap) {
        this.beatmapField.loadBeatmap(beatmap);
        this.hudOverlay.loadBeatmap(beatmap);
    }
    loadReplay(replay) {
        this.replayField.loadReplay(replay);
    }
    loadHUD(gameHUD) {
        this.hudOverlay.loadHUD(gameHUD);
    }
    setBackground(image) {
        const texture = Texture.from(image);
        this.background.setImage(texture);
    }
}

var Keypress;
(function (Keypress) {
    Keypress[Keypress["M1"] = 1] = "M1";
    Keypress[Keypress["M2"] = 2] = "M2";
    Keypress[Keypress["K1"] = 4] = "K1";
    Keypress[Keypress["K2"] = 8] = "K2";
    Keypress[Keypress["SMOKE"] = 16] = "SMOKE";
})(Keypress || (Keypress = {}));
class ReplayNode {
    constructor(timestamp, deltaTime, x, y, numericKeys) {
        this.prev = null;
        this.next = null;
        this.deltaTime = deltaTime;
        this.x = x;
        this.y = y;
        this.keypress = numericKeys;
        this.timestamp = timestamp;
    }
    translate(x, y) {
        this.x += x;
        this.y += y;
    }
    translateX(x) {
        this.x += x;
    }
    translateY(y) {
        this.y += y;
    }
    isHolding(key, exclusive = false) {
        if (exclusive) {
            switch (key) {
                case "K1": {
                    return this.keypress === (Keypress.K1 | Keypress.M1);
                }
                case "K2": {
                    return this.keypress === (Keypress.K2 | Keypress.M2);
                }
                case "M1": {
                    return this.keypress === Keypress.M1;
                }
                case "M2": {
                    return this.keypress === Keypress.M2;
                }
                default: {
                    return this.keypress !== 0;
                }
            }
        }
        switch (key) {
            case "K1": {
                return (this.keypress & Keypress.K1) === Keypress.K1;
            }
            case "K2": {
                return (this.keypress & Keypress.K2) === Keypress.K2;
            }
            case "M1": {
                return (this.keypress & Keypress.M1) === Keypress.M1;
            }
            case "M2": {
                return (this.keypress & Keypress.M2) === Keypress.M2;
            }
            case "SMOKE": {
                return (this.keypress & Keypress.SMOKE) === Keypress.SMOKE;
            }
            default: {
                return (this.keypress & ~(this.keypress & Keypress.SMOKE)) > 0;
            }
        }
    }
    isPressing(key, exclusive = false) {
        if (key === undefined) {
            const KEYS = ["K1", "K2", "M1", "M2"];
            return KEYS.some((key) => this.isPressing(key, exclusive));
        }
        if (this.prev === null) {
            return this.isHolding(key, exclusive);
        }
        return !this.prev.isHolding(key, exclusive) && this.isHolding(key, exclusive);
    }
    isReleasing(key, exclusive = false) {
        if (this.next === null) {
            return this.isHolding(key, exclusive);
        }
        return !this.next.isHolding(key, exclusive) && this.isHolding(key, exclusive);
    }
    setKeypress(...keys) {
        this.keypress = 0;
        this.addKeypress(...keys);
    }
    addKeypress(...keys) {
        keys.forEach((key) => (this.keypress |= key));
    }
    removeKeypress(key) {
        this.keypress = this.keypress & ~(this.keypress & key);
    }
    clone() {
        return new ReplayNode(this.timestamp, this.deltaTime, this.x, this.y, this.keypress);
    }
}

class ReplayData extends Array {
    constructor(replayData) {
        if (replayData === undefined) {
            super();
            return;
        }
        let nodes = [];
        if (typeof replayData === "string") {
            const parsedReplayData = replayData
                .split(",")
                .slice(0, -1) // there's an extra ',' on the last part of the replaydata string
                .map((row) => row.split("|").map(Number));
            let accumulatedTime = 0;
            for (let i = 0; i < parsedReplayData.length; i++) {
                const data = parsedReplayData[i];
                const [deltaTime, x, y, numericKeys] = data;
                accumulatedTime += deltaTime;
                const node = new ReplayNode(accumulatedTime, deltaTime, x, y, numericKeys);
                nodes.push(node);
            }
            for (let i = 0; i < parsedReplayData.length; i++) {
                if (i > 0)
                    nodes[i].prev = nodes[i - 1];
                if (i < parsedReplayData.length - 1) {
                    nodes[i].next = nodes[i + 1];
                }
            }
        }
        else if (replayData instanceof ReplayNode) {
            nodes = replayData;
        }
        super(nodes.length);
        for (let i = 0; i < nodes.length; i++) {
            this[i] = nodes[i];
        }
    }
    toString() {
        let str = "";
        this.forEach((node) => {
            str += `${node.deltaTime}|${node.x}|${node.y}|${node.keypress},`;
        });
        return str;
    }
    getMultipleNear(timestamp, prevCount = 0, nextCount = 0) {
        const index = this.getIndexNear(timestamp);
        const startIndex = Math.max(index - prevCount, 0);
        const endIndex = Math.min(index + nextCount + 1, this.length);
        return this.slice(startIndex, endIndex);
    }
    getMultiple(from, to) {
        const startIndex = this.getIndexNear(from);
        const endIndex = this.getIndexNear(to);
        return this.slice(startIndex, endIndex);
    }
    getIndexNear(timestamp) {
        let mid;
        let lo = 0;
        let hi = this.length - 1;
        while (hi - lo > 1) {
            mid = Math.floor((lo + hi) / 2);
            if (this[mid].timestamp < timestamp) {
                lo = mid;
            }
            else {
                hi = mid;
            }
        }
        if (timestamp - this[lo].timestamp <= this[hi].timestamp - timestamp) {
            return lo;
        }
        return hi;
    }
    getNear(timestamp) {
        return this[this.getIndexNear(timestamp)];
    }
    getPositionAt(timestamp, interpolate = false) {
        const index = this.getIndexNear(timestamp);
        const node = this[index];
        if (!interpolate) {
            return [node.x, node.y];
        }
        if (node.timestamp === timestamp) {
            return [node.x, node.y];
        }
        if (node.timestamp < timestamp) {
            const nextNode = this[index + 1];
            if (!nextNode) {
                return [node.x, node.y];
            }
            const deltaTime = nextNode.deltaTime;
            const deltaX = nextNode.x - node.x;
            const deltaY = nextNode.y - node.y;
            const timeDiff = timestamp - node.timestamp;
            const timeRatio = timeDiff / deltaTime;
            return [node.x + deltaX * timeRatio, node.y + deltaY * timeRatio];
        }
        else {
            const prevNode = this[index - 1];
            if (!prevNode) {
                return [node.x, node.y];
            }
            const deltaTime = node.deltaTime;
            const deltaX = node.x - prevNode.x;
            const deltaY = node.y - prevNode.y;
            const timeDiff = timestamp - prevNode.timestamp;
            const timeRatio = timeDiff / deltaTime;
            return [prevNode.x + deltaX * timeRatio, prevNode.y + deltaY * timeRatio];
        }
    }
}

const lzma = require("../../lib/lzma/lzma_worker.js").LZMA;
const leb = require("leb");
const EPOCH = 621355968000000000;
class Replay {
    constructor() {
        this.gameMode = 0;
        this.gameVersion = 0;
        this.beatmapMD5 = "";
        this.playerName = "";
        this.replayMD5 = "";
        this.number_300s = 0;
        this.number_100s = 0;
        this.number_50s = 0;
        this.gekis = 0;
        this.katus = 0;
        this.misses = 0;
        this.score = 0;
        this.maxCombo = 0;
        this.perfectCombo = 0;
        this.mods = new Mods();
        this.life_bar = "";
        this.timestamp = new Date(0);
        this.replayLength = 0;
        this.replayData = new ReplayData();
        this.unknown = 0;
    }
    toBlob() {
        return __awaiter(this, void 0, void 0, function* () {
            const replayBytes = yield write(this);
            const arrayBuffer = Uint8Array.from(replayBytes);
            return new Blob([arrayBuffer], {
                type: "application/x-osu-replay",
            });
        });
    }
    static FromBuffer(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield read(buffer);
        });
    }
    static FromArrayBuffer(arrayBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = Buffer.alloc(arrayBuffer.byteLength);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < buffer.length; ++i) {
                buffer[i] = view[i];
            }
            return yield read(buffer);
        });
    }
}
/* Parse Buffer to Replay Objcet */
function read(buff) {
    let offset = 0x00;
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        let replay = new Replay();
        try {
            replay.gameMode = readByte(buff);
            replay.gameVersion = readInteger(buff);
            replay.beatmapMD5 = readString(buff);
            replay.playerName = readString(buff);
            replay.replayMD5 = readString(buff);
            replay.number_300s = readShort(buff);
            replay.number_100s = readShort(buff);
            replay.number_50s = readShort(buff);
            replay.gekis = readShort(buff);
            replay.katus = readShort(buff);
            replay.misses = readShort(buff);
            replay.score = readInteger(buff);
            replay.maxCombo = readShort(buff);
            replay.perfectCombo = readByte(buff);
            replay.mods = new Mods(readInteger(buff));
            replay.life_bar = readString(buff);
            replay.timestamp = new Date(Number(readLong(buff) - BigInt(EPOCH)) / 10000);
            replay.replayLength = readInteger(buff);
            if (replay.replayLength != 0) {
                const replayDataString = yield readCompressedPromise(buff, replay.replayLength);
                replay.replayData = new ReplayData(replayDataString);
                replay.unknown = Number(readLong(buff));
            }
            resolve(replay);
        }
        catch (err) {
            reject(null);
        }
    }));
    function readByte(buffer) {
        offset++;
        return buffer.readInt8(offset - 1);
    }
    function readShort(buffer) {
        offset += 2;
        return buffer.readUIntLE(offset - 2, 2);
    }
    function readInteger(buffer) {
        offset += 4;
        return buffer.readInt32LE(offset - 4);
    }
    function readLong(buffer) {
        offset += 8;
        return buffer.readBigUInt64LE(offset - 8);
    }
    function readString(buffer) {
        if (buffer.readInt8(offset) == 0x0b) {
            offset++;
            let ulebString = leb.decodeUInt64(buffer.slice(offset, offset + 8));
            let strLength = ulebString.value;
            offset += strLength + ulebString.nextIndex;
            return buffer.slice(offset - strLength, offset).toString();
        }
        else {
            offset++;
            return "";
        }
    }
    function readCompressed(buffer, length, callback) {
        offset += length;
        return length != 0 ? lzma.decompress(buffer.slice(offset - length, offset), callback) : callback(null, null);
    }
    function readCompressedPromise(buffer, length) {
        return new Promise((resolve, reject) => {
            readCompressed(buffer, length, (result, err) => {
                if (result !== undefined) {
                    resolve(result);
                }
                else {
                    reject(err);
                }
            });
        });
    }
}
/* Write Replay Object to Buffer */
function write(replay) {
    return new Promise((resolve, reject) => {
        try {
            let gameMode = Buffer.from([replay.gameMode]);
            let gameVersion = writeInteger(replay.gameVersion);
            let beatmapMD5 = writeString(replay.beatmapMD5);
            let playerName = writeString(replay.playerName);
            let replayMD5 = writeString(replay.replayMD5);
            let number_300s = writeShort(replay.number_300s || 0);
            let number_100s = writeShort(replay.number_100s || 0);
            let number_50s = writeShort(replay.number_50s || 0);
            let gekis = writeShort(replay.gekis || 0);
            let katus = writeShort(replay.katus || 0);
            let misses = writeShort(replay.misses || 0);
            let score = writeInteger(replay.score || 0);
            let maxCombo = writeShort(replay.maxCombo || 0);
            let perfectCombo = new Buffer([replay.perfectCombo] || [0x01]);
            let mods = writeInteger(replay.mods.numeric);
            let life_bar = writeString(replay.life_bar || "");
            let timestamp = writeLong((replay.timestamp || new Date()).getTime() * 10000 + EPOCH);
            lzma.compress(replay.replayData.toString() || "", 1, (res, err) => {
                let replayData = Buffer.from(res);
                let replayLength = writeInteger(replayData.length);
                let unknown = writeLong(replay.unknown || 0);
                const finalResult = Buffer.concat([
                    gameMode,
                    gameVersion,
                    beatmapMD5,
                    playerName,
                    replayMD5,
                    number_300s,
                    number_100s,
                    number_50s,
                    gekis,
                    katus,
                    misses,
                    score,
                    maxCombo,
                    perfectCombo,
                    mods,
                    life_bar,
                    timestamp,
                    replayLength,
                    replayData,
                    unknown,
                ]);
                resolve(finalResult);
            });
        }
        catch (err) {
            reject(Buffer.from([0x00]));
        }
    });
    function writeString(text) {
        if (text.length > 0) {
            return Buffer.concat([Buffer.from([0x0b]), leb.encodeUInt32(text.length), Buffer.from(text)]);
        }
        return Buffer.from([0x00]);
    }
    function writeInteger(int) {
        let buffer = Buffer.alloc(4);
        buffer.writeInt32LE(int);
        return buffer;
    }
    function writeShort(short) {
        let buffer = Buffer.alloc(2);
        buffer.writeUIntLE(short, 0, 2);
        return buffer;
    }
    function writeLong(long) {
        let buffer = Buffer.alloc(8);
        buffer.writeBigUInt64LE(BigInt(long));
        return buffer;
    }
}

const DEFAULT_COLOURS = [
    [141, 174, 240],
    [115, 129, 241],
    [214, 214, 214],
    [160, 160, 160],
];
class Colours {
    constructor() {
        this.combo = [];
    }
    // "key : value" String Format Parsing
    parseStringArray(colourStringArray) {
        for (let colourString of colourStringArray) {
            if (colourString.includes("SliderTrackOverride")) {
                this.sliderTrackOverride = colourString.replace(/.+: */g, "").split(",").map(Number);
            }
            else if (colourString.includes("SliderBorder")) {
                this.sliderBorder = colourString.replace(/.+: */g, "").split(",").map(Number);
            }
            else {
                this.combo.push(colourString.replace(/.+: */g, "").split(",").map(Number));
            }
        }
        if (this.combo.length === 0) {
            this.combo = DEFAULT_COLOURS;
        }
    }
    get hex() {
        return this.combo.map((colour) => `#${colour.map((c) => c.toString(16).padStart(2, "0")).join("")}`);
    }
}

const PREEMPT_MIN = 450;
const TIME_PREEMPT = 600;
const TIME_FADEIN = 400;
class Difficulty {
    constructor() {
        this.hp = 5;
        this.cs = 5;
        this.od = 5;
        this.ar = 5;
        this.sliderMultiplier = 1.4;
        this.sliderTickRate = 1;
    }
    parseStringArray(args, mods) {
        // "key : value" String Format Parsing
        const [hp, cs, od, ar, sliderMultiplier, sliderTickRate] = args.map((row) => row.replace(/.+: */g, ""));
        this.hp = parseFloat(hp);
        this.cs = parseFloat(cs);
        this.od = parseFloat(od);
        this.ar = parseFloat(ar);
        this.sliderMultiplier = parseFloat(sliderMultiplier);
        this.sliderTickRate = parseFloat(sliderTickRate);
        this.mods = mods !== null && mods !== void 0 ? mods : new Mods();
        //console.log(this.mods);
    }
    // Source : https://github.com/ppy/osu/blob/3f31cb39c003990d01bad26cc610553a6e936851/osu.Game.Rulesets.Osu/Objects/OsuHitObject.cs
    get fadeIn() {
        return TIME_FADEIN * Math.min(1, TIME_PREEMPT / PREEMPT_MIN);
    }
    getPreempt(mods = this.mods) {
        let ar = this.getAR(mods);
        return difficultyRange(ar, 1800, 1200, PREEMPT_MIN);
    }
    getAR(mods = this.mods) {
        if (mods.contains(Mod.Easy)) {
            return this.ar / 2;
        }
        if (mods.contains(Mod.HardRock)) {
            return Math.min(this.ar * 1.4, 10);
        }
        else {
            return this.ar;
        }
    }
    getOD(mods = this.mods) {
        if (mods.contains(Mod.Easy)) {
            return this.od / 2;
        }
        if (mods.contains(Mod.HardRock)) {
            return Math.min(this.od * 1.4, 10);
        }
        else {
            return this.od;
        }
    }
    getCS(mods = this.mods) {
        if (mods.contains(Mod.Easy)) {
            return this.cs / 2;
        }
        if (mods.contains(Mod.HardRock)) {
            return Math.min(this.cs * 1.3, 10);
        }
        else {
            return this.cs;
        }
    }
    getHP(mods = this.mods) {
        if (mods.contains(Mod.Easy)) {
            return this.hp / 2;
        }
        if (mods.contains(Mod.HardRock)) {
            return Math.min(this.hp * 1.4, 10);
        }
        else {
            return this.hp;
        }
    }
    getObjectRadius(mods = this.mods) {
        const cs = this.getCS(mods);
        const r = difficultyRange(cs, 54.4, 32, 9.6);
        return r;
    }
    getHitWindows(mods = this.mods) {
        const hit300 = 79 - this.getOD(mods) * 6 + 0.5;
        const hit100 = 139 - this.getOD(mods) * 8 + 0.5;
        const hit50 = 199 - this.getOD(mods) * 10 + 0.5;
        return [hit300, hit100, hit50];
    }
}
/*
    Source: https://github.com/ppy/osu/blob/3f31cb39c003990d01bad26cc610553a6e936851/osu.Game/Beatmaps/IBeatmapDifficultyInfo.cs#L56
*/
function difficultyRange(difficulty, min, mid, max) {
    if (difficulty > 5)
        return mid + ((max - mid) * (difficulty - 5)) / 5;
    if (difficulty < 5)
        return mid - ((mid - min) * (5 - difficulty)) / 5;
    return mid;
}

class Editor {
    parseStringArray(args) {
        // "key : value" String Format Parsing
        const [bookmarks, distanceSpacing, beatDivisor, gridSize, timelineZoom] = args.map((row) => row.replace(/.+: */g, ""));
        this.bookmarks = bookmarks.split(",").map(Number);
        this.distanceSpacing = parseFloat(distanceSpacing);
        this.beatDivisor = parseInt(beatDivisor);
        this.gridSize = parseInt(gridSize);
        this.timelineZoom = parseFloat(timelineZoom);
    }
}

/* enum EventType {
    Background = 0,
    Video = 1,
    Break = 2,
} */
class BackgroundEvent {
    constructor(startTime, eventParams) {
        this.eventType = "background";
        const [filename, xOffset, yOffset] = eventParams;
        this.startTime = startTime;
        this.filename = filename.replace(/^"(.*)"$/, "$1");
        this.xOffset = parseInt(xOffset);
        this.yOffset = parseInt(yOffset);
    }
}
class VideoEvent {
    constructor(startTime, eventParams) {
        this.eventType = "video";
        const [filename, xOffset, yOffset] = eventParams;
        this.startTime = startTime;
        this.filename = filename.replace(/^"(.*)"$/, "$1");
        this.xOffset = parseInt(xOffset);
        this.yOffset = parseInt(yOffset);
    }
}
class BreakEvent {
    constructor(startTime, eventParams) {
        this.eventType = "break";
        this.startTime = startTime;
        this.endTime = parseInt(eventParams[0]);
    }
}
class Events {
    constructor() {
        this.events = [];
    }
    parseStringArray(eventStringArray) {
        this.events = eventStringArray
            .map((eventString) => {
            const [eventType, startTime, ...eventParams] = eventString.split(",");
            switch (+eventType) {
                case 0: {
                    return new BackgroundEvent(+startTime, eventParams);
                }
                case 1: {
                    return new VideoEvent(+startTime, eventParams);
                }
                case 2: {
                    return new BreakEvent(+startTime, eventParams);
                }
            }
        })
            .filter((event) => event !== undefined);
    }
}

class General {
    parseStringArray(args) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        // Parse "key : value" string format
        function findValueByKey(key) {
            const rowFound = args.find((row) => row.split(":")[0].toLowerCase() === key.toLowerCase());
            if (rowFound) {
                return rowFound.replace(/.+: */g, "");
            }
            else {
                return null;
            }
        }
        this.audioFilename = (_a = findValueByKey("audioFilename")) !== null && _a !== void 0 ? _a : "";
        this.audioLeadIn = parseInt((_b = findValueByKey("audioLeadIn")) !== null && _b !== void 0 ? _b : "0");
        this.previewTime = parseInt((_c = findValueByKey("previewTime")) !== null && _c !== void 0 ? _c : "-1");
        this.countdown = parseInt((_d = findValueByKey("countdown")) !== null && _d !== void 0 ? _d : "1");
        this.sampleSet = (_e = findValueByKey("sampleSet")) !== null && _e !== void 0 ? _e : "Normal";
        this.stackLeniency = parseFloat((_f = findValueByKey("stackLeniency")) !== null && _f !== void 0 ? _f : "0.7");
        this.mode = parseInt((_g = findValueByKey("mode")) !== null && _g !== void 0 ? _g : "0");
        this.letterboxInBreaks = parseInt((_h = findValueByKey("letterboxInBreaks")) !== null && _h !== void 0 ? _h : "0");
        this.widescreenStoryboard = parseInt((_j = findValueByKey("widescreenStoryboard")) !== null && _j !== void 0 ? _j : "0");
        this.useSkinSprites = parseInt((_k = findValueByKey("useSkinSprites")) !== null && _k !== void 0 ? _k : "0");
        this.overlayPosition = (_l = findValueByKey("overlayPosition")) !== null && _l !== void 0 ? _l : "NoChange";
        this.skinPreference = (_m = findValueByKey("skinPreference")) !== null && _m !== void 0 ? _m : "";
        this.epilepsyWarning = parseInt((_o = findValueByKey("epilepsyWarning")) !== null && _o !== void 0 ? _o : "0");
        this.countdownOffset = parseInt((_p = findValueByKey("countdownOffset")) !== null && _p !== void 0 ? _p : "0");
        this.sampleMatchPlaybackRate = parseInt((_q = findValueByKey("sampleMatchPlaybackRate")) !== null && _q !== void 0 ? _q : "0");
    }
}

class MathHelper {
    static BinomialCoefficient(n, k) {
        return this.Factorial(n) / (this.Factorial(k) * this.Factorial(n - k));
    }
    static Factorial(n) {
        return n < 2 ? 1 : n * this.Factorial(n - 1);
    }
    static Clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    static Lerp(t, from, to, targetFrom, targetTo) {
        return (t / (to - from)) * (targetTo - targetFrom) + targetFrom;
    }
    static Sum(numbers) {
        let result = 0;
        for (let i = 0; i < numbers.length; i++) {
            result += numbers[i];
        }
        return result;
    }
    static Average(numbers) {
        return numbers.length === 0 ? 0 : this.Sum(numbers) / numbers.length;
    }
    static InsideCircle(center, point, radius) {
        const dx = point[0] - center[0];
        const dy = point[1] - center[1];
        return dx * dx + dy * dy <= radius * radius;
    }
}

class CircularArcProperties {
    constructor(thetaStart, thetaRange, direction, radius, center) {
        this.isValid = true;
        this.thetaStart = thetaStart;
        this.thetaRange = thetaRange;
        this.direction = direction;
        this.radius = radius;
        this.center = center;
    }
    get thetaEnd() {
        return this.thetaStart + this.thetaRange * this.direction;
    }
}
class PathApproximator {
    static ApproximateLinear(controlPoints) {
        return controlPoints.map((point) => point.clone());
    }
    static ApproximateBezier(controlPoints) {
        const output = new Array();
        let n = controlPoints.length - 1;
        if (n < 0) {
            return output;
        }
        const toFlatten = new Array();
        const freeBuffers = new Array();
        let subdivisionBuffer1 = new Array();
        let subdivisionBuffer2 = new Array();
        let leftChild = subdivisionBuffer2;
        toFlatten.push([...controlPoints]);
        while (toFlatten.length > 0) {
            let parent = toFlatten.pop();
            if (this.bezierIsFlatEnough(parent)) {
                this.bezierApproximate(parent, output, subdivisionBuffer1, subdivisionBuffer2, n + 1);
                freeBuffers.push(parent);
                continue;
            }
            let rightChild = freeBuffers.length > 0 ? freeBuffers.pop() : new Array();
            this.bezierSubdivide(parent, leftChild, rightChild, subdivisionBuffer1, n + 1);
            for (let i = 0; i < n + 1; i++) {
                parent[i] = leftChild[i];
            }
            toFlatten.push(rightChild);
            toFlatten.push(parent);
        }
        output.push(controlPoints[n]);
        return output;
    }
    static ApproximateCatmull(controlPoints) {
        let result = new Array();
        for (let i = 0; i < controlPoints.length - 1; i++) {
            let v1 = i > 0 ? controlPoints[i - 1] : controlPoints[i];
            let v2 = controlPoints[i];
            let v3 = i < controlPoints.length - 1 ? controlPoints[i + 1] : v2.add(v2).subtract(v1);
            let v4 = i < controlPoints.length - 2 ? controlPoints[i + 2] : v3.add(v3).subtract(v2);
            for (let c = 0; c < this.CATMULL_DETAIL; c++) {
                result.push(this.catmullFindPoint(v1, v2, v3, v4, c / this.CATMULL_DETAIL));
                result.push(this.catmullFindPoint(v1, v2, v3, v4, (c + 1) / this.CATMULL_DETAIL));
            }
        }
        return result;
    }
    static ApproximateCircularArc(controlPoints) {
        const asd = [...controlPoints];
        let circularArcProperty = this.circularArcProperties(asd);
        if (!circularArcProperty.isValid) {
            return [...controlPoints];
        }
        const pr = circularArcProperty;
        const amountPoints = 2 * pr.radius <= this.CIRCULAR_ARC_TOLERANCE
            ? 2
            : Math.max(2, Math.ceil(pr.thetaRange / (2 * Math.acos(1 - this.CIRCULAR_ARC_TOLERANCE / pr.radius))));
        const output = new Array();
        for (let i = 0; i < amountPoints; ++i) {
            const fract = i / (amountPoints - 1);
            const theta = pr.thetaStart + pr.direction * fract * pr.thetaRange;
            const o = new Vector2(Math.cos(theta), Math.sin(theta)).multiply(pr.radius);
            output.push(pr.center.add(o));
        }
        return output;
    }
    static bezierIsFlatEnough(controlPoints) {
        for (let i = 1; i < controlPoints.length - 1; i++) {
            const r = controlPoints[i - 1].subtract(controlPoints[i].multiply(2)).add(controlPoints[i + 1]);
            const lengthSquared = r.lengthSquared();
            if (lengthSquared > this.BEZIER_TOLERANCE * this.BEZIER_TOLERANCE * 4) {
                return false;
            }
        }
        return true;
    }
    static bezierSubdivide(controlPoints, l, r, subdivisionBuffer, count) {
        const midpoints = subdivisionBuffer;
        for (let i = 0; i < count; i++) {
            midpoints[i] = controlPoints[i];
        }
        for (let i = 0; i < count; i++) {
            l[i] = midpoints[0];
            r[count - i - 1] = midpoints[count - i - 1];
            for (let j = 0; j < count - i - 1; j++) {
                midpoints[j] = Vector2.Midpoint(midpoints[j], midpoints[j + 1]);
            }
        }
    }
    static bezierApproximate(controlPoints, output, subdivisionBuffer1, subdivisionBuffer2, count) {
        let l = subdivisionBuffer2;
        let r = subdivisionBuffer1;
        this.bezierSubdivide(controlPoints, l, r, subdivisionBuffer1, count);
        for (let i = 0; i < count - 1; i++) {
            l[count + i] = r[i + 1];
        }
        output.push(controlPoints[0].clone());
        for (let i = 1; i < count - 1; i++) {
            let index = 2 * i;
            const p = l[index - 1]
                .add(l[index].multiply(2))
                .add(l[index + 1])
                .multiply(0.25);
            output.push(p);
        }
    }
    static circularArcProperties(controlPoints) {
        const [a, b, c] = controlPoints;
        // If we have a degenerate triangle where a side-length is almost zero, then give up and fallback to a more numerically stable method.
        if (Math.abs((b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1])) < this.EPSILON) {
            return { isValid: false };
        }
        // See: https://en.wikipedia.org/wiki/Circumscribed_circle#Cartesian_coordinates_2
        const d = 2 * (a[0] * b.subtract(c)[1] + b[0] * c.subtract(a)[1] + c[0] * a.subtract(b)[1]);
        const aSq = a.lengthSquared();
        const bSq = b.lengthSquared();
        const cSq = c.lengthSquared();
        const center = new Vector2((aSq * (b[1] - c[1]) + bSq * (c[1] - a[1]) + cSq * (a[1] - b[1])) / d, (aSq * (c[0] - b[0]) + bSq * (a[0] - c[0]) + cSq * (b[0] - a[0])) / d);
        const dA = a.subtract(center);
        const dC = c.subtract(center);
        const radius = dA.length();
        let thetaStart = Math.atan2(dA[1], dA[0]);
        let thetaEnd = Math.atan2(dC[1], dC[0]);
        while (thetaEnd < thetaStart) {
            thetaEnd += 2 * Math.PI;
        }
        let dir = 1;
        let thetaRange = thetaEnd - thetaStart;
        // Decide in which direction to draw the circle, depending on which side of
        // AC B lies.
        const orthoAtoC = c.subtract(a).rotate(-Math.PI / 2);
        if (Vector2.Dot(orthoAtoC, b.subtract(a)) < 0) {
            dir = -dir;
            thetaRange = 2 * Math.PI - thetaRange;
        }
        return new CircularArcProperties(thetaStart, thetaRange, dir, radius, center);
    }
    static catmullFindPoint(vec1, vec2, vec3, vec4, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        return new Vector2(0.5 *
            (2 * vec2[0] +
                (-vec1[0] + vec3[0]) * t +
                (2 * vec1[0] - 5 * vec2[0] + 4 * vec3[0] - vec4[0]) * t2 +
                (-vec1[0] + 3 * vec2[0] - 3 * vec3[0] + vec4[0]) * t3), 0.5 *
            (2 * vec2[1] +
                (-vec1[1] + vec3[1]) * t +
                (2 * vec1[1] - 5 * vec2[1] + 4 * vec3[1] - vec4[1]) * t2 +
                (-vec1[1] + 3 * vec2[1] - 3 * vec3[1] + vec4[1]) * t3));
    }
}
PathApproximator.BEZIER_TOLERANCE = 0.25;
PathApproximator.EPSILON = 1e-3;
PathApproximator.CIRCULAR_ARC_TOLERANCE = 0.25;
PathApproximator.CATMULL_DETAIL = 50;

class PathHelper {
    static CalculateLength(pathPoints) {
        let length = 0;
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const current = pathPoints[i];
            const next = pathPoints[i + 1];
            length += Vector2.Distance(current, next);
        }
        return length;
    }
    static TrimPath(path, maxLength) {
        const result = new Array();
        if (path.length < 1) {
            return result;
        }
        result.push(path[0]);
        let length = 0;
        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const current = path[i];
            const distance = Vector2.Distance(prev, current);
            if (length + distance > maxLength) {
                const t = (maxLength - length) / distance;
                const interp = new Vector2(prev[0] * (1 - t) + current[0] * t, prev[1] * (1 - t) + current[1] * t);
                result.push(interp);
                break;
            }
            length += distance;
            result.push(path[i]);
        }
        return result;
    }
    static GetPointAt(pathPoints, time) {
        time = MathHelper.Clamp(time, 0, 1);
        let result = null;
        const totalLength = PathHelper.CalculateLength(pathPoints);
        const expectedLength = totalLength * time;
        let length = 0;
        for (let i = 1; i < pathPoints.length; i++) {
            const prev = pathPoints[i - 1];
            const current = pathPoints[i];
            const dist = Vector2.Distance(prev, current);
            if (length + dist > expectedLength) {
                const t = (expectedLength - length) / dist;
                result = Vector2.LinearInterpolation(prev, current, t);
                break;
            }
            length += dist;
        }
        // Just in case something weird happened related to float precision bullshit
        if (!result) {
            result = pathPoints[pathPoints.length - 1];
        }
        return result;
    }
    static Interpolate(path, maxSegmentLength) {
        const result = new Array();
        if (path.length < 1) {
            return result;
        }
        result.push(path[0]);
        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const current = path[i];
            const distance = Vector2.Distance(prev, current);
            const divideCount = Math.floor(distance / maxSegmentLength);
            for (let j = 0; j < divideCount; j++) {
                const t = (j + 1) / (divideCount + 1);
                result.push(new Vector2(prev[0] * (1 - t) + current[0] * t, prev[1] * (1 - t) + current[1] * t));
            }
            result.push(path[i]);
        }
        return result;
    }
    static SplitControlPoints(controlPoints) {
        const pathsControlPoints = new Array();
        let startIndex = 0;
        for (let i = 1; i < controlPoints.length; i++) {
            const prev = controlPoints[i - 1];
            const current = controlPoints[i];
            if (Vector2.Equals(prev, current) || i === controlPoints.length - 1) {
                const newControlPoints = [];
                const endIndex = i === controlPoints.length - 1 ? i + 1 : i;
                for (let j = startIndex; j < endIndex; j++) {
                    newControlPoints.push(controlPoints[j]);
                }
                pathsControlPoints.push(newControlPoints);
                startIndex = i;
            }
        }
        return pathsControlPoints;
    }
    static CombinePath(pathsControlPoints, pathType) {
        const result = [];
        for (let i = 0; i < pathsControlPoints.length; i++) {
            let path = new Array();
            const controlPoints = pathsControlPoints[i];
            switch (pathType) {
                case "B": {
                    path = PathApproximator.ApproximateBezier(controlPoints);
                    break;
                }
                case "P": {
                    path = PathApproximator.ApproximateCircularArc(controlPoints);
                    break;
                }
                case "C": {
                    path = PathApproximator.ApproximateCatmull(controlPoints);
                    break;
                }
                case "L":
                default: {
                    path = PathApproximator.ApproximateLinear(controlPoints);
                    break;
                }
            }
            // If it's not the first path, append path points except for the first point because it's already there,
            // which is the last point of the previous path
            const startIndex = i === 0 ? 0 : 1;
            for (let i = startIndex; i < path.length; i++) {
                result.push(path[i]);
            }
        }
        return result;
    }
    static RoundCoordinates(path) {
        const result = [];
        for (let i = 0; i < path.length; i++) {
            const vec = new Vector2(Math.round(path[i][0]), Math.round(path[i][1]));
            result.push(vec);
        }
        return result;
    }
    /*
        (c) 2017, Vladimir Agafonkin
        Simplify.js, a high-performance JS polyline simplification library
        mourner.github.io/simplify-js
    */
    static Simplify(path, tolerance, highQuality) {
        if (path.length < 2) {
            return path;
        }
        const sqTolerance = tolerance * tolerance;
        path = highQuality ? path : this.simplifyRadialDist(path, sqTolerance);
        path = this.simplifyDouglasPeucker(path, sqTolerance);
        return path;
    }
    static simplifyRadialDist(path, sqTolerance) {
        let prevPoint = path[0];
        let newPoints = [prevPoint];
        let point = path[1];
        for (let i = 1, len = path.length; i < len; i++) {
            point = path[i];
            if (Vector2.DistanceSquared(point, prevPoint) > sqTolerance) {
                newPoints.push(point);
                prevPoint = point;
            }
        }
        if (prevPoint !== point) {
            newPoints.push(point);
        }
        return newPoints;
    }
    static simplifyDouglasPeucker(path, sqTolerance) {
        let last = path.length - 1;
        let simplified = [path[0]];
        this.simplifyDPStep(path, 0, last, sqTolerance, simplified);
        simplified.push(path[last]);
        return simplified;
    }
    static simplifyDPStep(path, first, last, sqTolerance, simplified) {
        let maxSqDist = sqTolerance;
        let index = 0;
        for (let i = first + 1; i < last; i++) {
            let sqDist = this.getSqSegDist(path[i], path[first], path[last]);
            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }
        if (maxSqDist > sqTolerance) {
            if (index - first > 1) {
                this.simplifyDPStep(path, first, index, sqTolerance, simplified);
            }
            simplified.push(path[index]);
            if (last - index > 1) {
                this.simplifyDPStep(path, index, last, sqTolerance, simplified);
            }
        }
    }
    static getSqSegDist(p, p1, p2) {
        var x = p1[0], y = p1[1], dx = p2[0] - x, dy = p2[1] - y;
        if (dx !== 0 || dy !== 0) {
            var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
            if (t > 1) {
                x = p2[0];
                y = p2[1];
            }
            else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }
        dx = p[0] - x;
        dy = p[1] - y;
        return dx * dx + dy * dy;
    }
}

// kinda buggy dont touch pls
class Path {
    constructor(pathType, controlPoints, maxLength) {
        this.pathType = pathType;
        this.maxLength = maxLength;
        // Maximum length of each path segment
        this.PATH_DETAIL = 10;
        if (controlPoints[0] instanceof Vector2) {
            this.controlPoints = controlPoints;
        }
        else {
            this.controlPoints = controlPoints.map((controlPoint) => new Vector2(controlPoint[0], controlPoint[1]));
        }
        const curvesPath = PathHelper.SplitControlPoints(this.controlPoints);
        this.points = PathHelper.CombinePath(curvesPath, this.pathType);
        if (maxLength) {
            this.points = PathHelper.TrimPath(this.points, maxLength);
        }
        // Equal-ish distance between points no matter where it is, useful for reducing the amount of points
        // this.points = PathHelper.Simplify(this.points, 1, true);
        // this.points = PathHelper.Interpolate(this.points, this.PATH_DETAIL);
    }
    move(startX, startY, endX, endY) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i][0] += endX - startX;
            this.points[i][1] += endY - startY;
        }
        return this;
    }
    translate(x, y) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i][0] += x;
            this.points[i][1] += y;
        }
        return this;
    }
    scale(xOrScale, y) {
        if (y === undefined) {
            for (let i = 0; i < this.points.length; i++) {
                this.points[i][0] *= xOrScale;
                this.points[i][1] *= xOrScale;
            }
        }
        else {
            for (let i = 0; i < this.points.length; i++) {
                this.points[i][0] *= xOrScale;
                this.points[i][1] *= y;
            }
        }
        return this;
    }
    getLength() {
        return PathHelper.CalculateLength(this.points);
    }
    // TODO: optimize this , should be easy
    getPointAt(t) {
        return PathHelper.GetPointAt(this.points, t);
    }
    getTranslatedPoints(xOrTranslationOrVector, y) {
        const result = [];
        if (typeof xOrTranslationOrVector === "number") {
            const x = xOrTranslationOrVector;
            if (y === undefined) {
                for (let i = 0; i < this.points.length; i++) {
                    result.push(this.points[i].add(x));
                }
            }
            else {
                for (let i = 0; i < this.points.length; i++) {
                    const point = this.points[i].add([x, y]);
                    result.push(point);
                }
            }
        }
        else {
            const vector = xOrTranslationOrVector;
            for (let i = 0; i < this.points.length; i++) {
                const point = this.points[i].add([vector[0], vector[1]]);
                result.push(point);
            }
        }
        return result;
    }
    clone() {
        const controlPoints = this.controlPoints.map((point) => point.clone());
        return new Path(this.pathType, controlPoints, this.maxLength);
    }
}

function generateInOut(inFunc, outFunc) {
    return function (x) {
        return x < 0.5 ? inFunc(x * 2) / 2 : outFunc(x * 2 - 1) / 2 + 0.5;
    };
}
function elasticBase(x) {
    const n = 7;
    const p = 0.38;
    return 1 + -1 * Math.pow(2, -1 * n * x) * Math.cos((2 * Math.PI * x) / p);
}
function bounceBase(x) {
    const g = 100;
    const f = 0.4;
    const T = 2 * Math.sqrt(1 / g);
    const q = 1 - g * Math.pow(((x % T) - T / 2), 2);
    return Math.pow(f, Math.floor(x / T)) * q;
}
class EasingFunction {
    static Linear(x) {
        return x;
    }
    static InQuad(x) {
        return Math.pow(x, 2);
    }
    static OutQuad(x) {
        return -(Math.pow((x - 1), 2)) + 1;
    }
    static InOutQuad(x) {
        return generateInOut(this.InQuad, this.OutQuad)(x);
    }
    static InCubic(x) {
        return Math.pow(x, 3);
    }
    static OutCubic(x) {
        return Math.pow((x - 1), 3) + 1;
    }
    static InOutCubic(x) {
        return generateInOut(this.InCubic, this.OutCubic)(x);
    }
    static InQuart(x) {
        return Math.pow(x, 4);
    }
    static OutQuart(x) {
        return -(Math.pow((x - 1), 4)) + 1;
    }
    static InOutQuart(x) {
        return generateInOut(this.InQuart, this.OutQuart)(x);
    }
    static InQuint(x) {
        return Math.pow(x, 5);
    }
    static OutQuint(x) {
        return Math.pow((x - 1), 5) + 1;
    }
    static InOutQuint(x) {
        return generateInOut(this.InQuint, this.OutQuint)(x);
    }
    static InSine(x) {
        return 1 - Math.cos((x * Math.PI) / 2);
    }
    static OutSine(x) {
        return Math.sin((x * Math.PI) / 2);
    }
    static InOutSine(x) {
        return generateInOut(this.InSine, this.OutSine)(x);
    }
    static InExpo(x) {
        return x === 0 ? 0 : Math.pow(2, (10 * (x - 1)));
    }
    static OutExpo(x) {
        return x === 1 ? 1 : 1 - Math.pow(2, (-10 * x));
    }
    static InOutExpo(x) {
        return generateInOut(this.InExpo, this.OutExpo)(x);
    }
    static InCirc(x) {
        return 1 - Math.sqrt(1 - x * x);
    }
    static OutCirc(x) {
        return Math.sqrt(-(Math.pow((x - 1), 2)) + 1);
    }
    static InOutCirc(x) {
        return generateInOut(this.InCirc, this.OutCirc)(x);
    }
    static InElastic(x) {
        return 1 - this.OutElastic(1 - x);
    }
    static OutElastic(x) {
        return elasticBase(x);
    }
    static InOutElastic(x) {
        return generateInOut(this.InElastic, this.OutElastic)(x);
    }
    static InBounce(x) {
        return 1 - this.OutBounce(1 - x);
    }
    static OutBounce(x) {
        return 1 - (x < 0.2 ? bounceBase(x / 2 + 0.1) : bounceBase(x));
    }
    static InOutBounce(x) {
        return generateInOut(this.InBounce, this.OutBounce)(x);
    }
}

// Holds possibly different values depending on the given time
class Easer {
    constructor(fallbackValue = 0) {
        this.fallbackValue = fallbackValue;
        this.easings = [];
        this.time = 0;
    }
    static CreateEasing(startTime, endTime, targetFrom, targetTo, easingType = "Linear") {
        return { startTime, endTime, targetFrom, targetTo, easingType };
    }
    get value() {
        return this.getValueAt(this.time);
    }
    getValueAt(time) {
        if (this.easings.length === 0) {
            return this.fallbackValue;
        }
        let result = undefined;
        let selectedEasing = undefined;
        for (let i = this.easings.length - 1; i >= 0; i--) {
            selectedEasing = this.easings[i];
            if (time > selectedEasing.endTime || time < selectedEasing.startTime) {
                continue;
            }
            const t = (time - selectedEasing.startTime) / (selectedEasing.endTime - selectedEasing.startTime);
            result =
                EasingFunction[selectedEasing.easingType](t) * (selectedEasing.targetTo - selectedEasing.targetFrom) +
                    selectedEasing.targetFrom;
            break;
        }
        if (result === undefined) {
            let minDeltaTime = Infinity;
            let closestIndexBefore = 0;
            // edge case, time is before the first easing
            if (time < this.easings[0].startTime) {
                result = this.easings[0].targetFrom;
            }
            else {
                for (let i = 0; i < this.easings.length; i++) {
                    const easing = this.easings[i];
                    const deltaTime = time - easing.endTime;
                    if (deltaTime < 0) {
                        break;
                    }
                    if (minDeltaTime > deltaTime) {
                        minDeltaTime = deltaTime;
                        closestIndexBefore = i;
                    }
                }
                const closestEasing = this.easings[closestIndexBefore];
                result = closestEasing.targetTo;
            }
        }
        return result;
    }
    addEasing(easingsOrStartTime, endTime, targetFrom, targetTo, easingType = "Linear") {
        if (typeof easingsOrStartTime === "number") {
            const startTime = easingsOrStartTime;
            this.easings.push({
                startTime: startTime,
                endTime: endTime,
                targetFrom: targetFrom,
                targetTo: targetTo,
                easingType: easingType,
            });
        }
        else {
            this.easings.push(...arguments);
        }
        return this;
    }
    removeEasing(...easings) {
        this.easings = this.easings.filter((e) => !easings.includes(e));
    }
    removeAllEasings() {
        this.easings = [];
    }
}

class Animation {
    constructor(animationType) {
        this.animationType = animationType;
        this.animationEasers = [];
    }
    setSequence(easer, easings) {
        const easerIndex = this.animationEasers.findIndex((animationEaser) => animationEaser.easer === easer);
        if (easerIndex === -1) {
            this.animationEasers.push({ easer, easings: easings });
            easer.addEasing(...easings);
            return;
        }
        const oldEasings = this.animationEasers[easerIndex].easings;
        this.animationEasers[easerIndex].easer.removeEasing(...oldEasings);
        easer.addEasing(...easings);
    }
    addSequence(easer, easings) {
        const easerIndex = this.animationEasers.findIndex((animationEaser) => animationEaser.easer === easer);
        if (easerIndex === -1) {
            this.setSequence(easer, easings);
            return;
        }
        this.animationEasers[easerIndex].easings.push(...easings);
        easer.addEasing(...easings);
    }
    removeSequence(sequence) {
        const easerIndex = this.animationEasers.findIndex((animationEaser) => animationEaser.easer === sequence.easer);
        this.animationEasers[easerIndex].easer.removeEasing(...sequence.easings);
        this.animationEasers.splice(easerIndex, 1);
    }
}

class DrawableHitObject {
    constructor() {
        this.animations = [];
    }
    // Called every game tick, depends on the replay node density and playback rate
    update(time) {
        this.removeFutureAnimation(time);
    }
    // Called every frames, ideally 60 frames per seconds / every 16.6 ms
    draw(time) { }
    playAnimation(animationType, easer, easings) {
        const animationIndex = this.animations.findIndex((anim) => anim.animationType === animationType);
        if (animationIndex === -1) {
            const animation = new Animation(animationType);
            this.animations.push(animation);
            animation.addSequence(easer, easings);
            return;
        }
        this.animations[animationIndex].addSequence(easer, easings);
    }
    removeFutureAnimation(time) {
        this.animations.forEach((anim) => {
            const futureAnimEasers = anim.animationEasers.filter((animEasers) => {
                return Math.min(...animEasers.easings.map((easing) => easing.startTime)) > time;
            });
            futureAnimEasers.forEach((pog) => {
                anim.removeSequence(pog);
            });
        });
    }
    animate(animationType, time) { }
}

class DrawableHitCircle extends DrawableHitObject {
    constructor(hitObject) {
        super();
        this.hitObject = hitObject;
        this.positionOffset = {
            x: new Easer(0),
            y: new Easer(0),
        };
        this.scale = new Easer(1);
        const diff = hitObject.difficulty;
        const fadeIn = diff.fadeIn;
        const preempt = diff.getPreempt();
        const appearTime = hitObject.startTime - preempt;
        const opacity = new Easer();
        if (diff.mods.contains(Mod.Hidden)) {
            opacity.addEasing(appearTime, appearTime + preempt * 0.4, 0, 1);
            opacity.addEasing(appearTime + preempt * 0.4, appearTime + preempt * 0.7, 1, 0);
        }
        else {
            opacity.addEasing(appearTime, appearTime + fadeIn, 0, 1);
            opacity.addEasing(hitObject.endTime, hitObject.endTime + 150, 1, 0);
        }
        const approachCircleOpacity = new Easer(0);
        if (diff.mods.contains(Mod.Hidden)) {
            if (hitObject.objectIndex === 0) {
                approachCircleOpacity.addEasing(0, Math.min(fadeIn * 2, preempt), 0, 1);
                approachCircleOpacity.addEasing(Math.min(fadeIn * 2, preempt), Math.min(fadeIn * 2, preempt) * 2, 1, 0);
            }
        }
        else {
            approachCircleOpacity.addEasing(appearTime, appearTime + Math.min(fadeIn * 2, preempt), 0, 1);
            approachCircleOpacity.addEasing(hitObject.startTime, hitObject.startTime + 150, 1, 0);
        }
        const approachCircleScale = new Easer(1);
        approachCircleScale.addEasing(appearTime, hitObject.startTime, 4, 1);
        this.opacity = opacity;
        this.approachCircleOpacity = approachCircleOpacity;
        this.approachCircleScale = approachCircleScale;
        this.animate("HIT", hitObject.endTime);
    }
    draw(time) {
        this.opacity.time = time;
        this.scale.time = time;
        this.approachCircleOpacity.time = time;
        this.approachCircleScale.time = time;
        this.positionOffset.x.time = time;
        this.positionOffset.y.time = time;
    }
    animate(animation, time) {
        switch (animation) {
            case "SHAKE": {
                this.playAnimation("SHAKE", this.positionOffset.x, shake(time));
                break;
            }
            case "MISS": {
                if (this.hitObject.difficulty.mods.contains(Mod.Hidden)) {
                    break;
                }
                this.playAnimation("MISS", this.opacity, miss(time));
                this.playAnimation("MISS", this.approachCircleOpacity, miss(time));
                break;
            }
            case "HIT": {
                if (this.hitObject.difficulty.mods.contains(Mod.Hidden)) {
                    break;
                }
                this.playAnimation("HIT", this.opacity, opacityAfterHit(time));
                this.playAnimation("HIT", this.scale, scaleAfterHit(time));
                break;
            }
        }
    }
}
function shake(time) {
    const shakeoffset = 7;
    const shakeTimeStep = 50;
    const right = Easer.CreateEasing(time, time + shakeTimeStep, 0, shakeoffset);
    const left = Easer.CreateEasing(time + shakeTimeStep, time + shakeTimeStep * 3, shakeoffset, -shakeoffset);
    const center = Easer.CreateEasing(time + shakeTimeStep * 3, time + shakeTimeStep * 4, -shakeoffset, 0, "OutBounce");
    return [right, left, center];
}
function miss(time) {
    const fadeOutTime = 80;
    const fadeOut = Easer.CreateEasing(time, time + fadeOutTime, 1, 0);
    return [fadeOut];
}
function opacityAfterHit(time) {
    const fadeOutTime = 150;
    const fadeOut = Easer.CreateEasing(time, time + fadeOutTime, 1, 0, "OutQuad");
    return [fadeOut];
}
function scaleAfterHit(time) {
    const scaleOutTime = 150;
    const scaleOut = Easer.CreateEasing(time, time + scaleOutTime, 1, 1.25);
    return [scaleOut];
}

var HitObjectType;
(function (HitObjectType) {
    HitObjectType[HitObjectType["HitCircle"] = 1] = "HitCircle";
    HitObjectType[HitObjectType["Slider"] = 2] = "Slider";
    HitObjectType[HitObjectType["Spinner"] = 8] = "Spinner";
    HitObjectType[HitObjectType["NewCombo"] = 4] = "NewCombo";
    HitObjectType[HitObjectType["ColorSkip1"] = 16] = "ColorSkip1";
    HitObjectType[HitObjectType["ColorSkip2"] = 32] = "ColorSkip2";
    HitObjectType[HitObjectType["ColorSkip3"] = 64] = "ColorSkip3";
})(HitObjectType || (HitObjectType = {}));
class Hitsample {
    constructor(normalSet, additionSet, index, volume, filename) {
        this.normalSet = normalSet;
        this.additionSet = additionSet;
        this.index = index;
        this.volume = volume;
        this.filename = filename;
    }
}
class HitObject {
    constructor(hitObjectConfig) {
        this.colour = "#ffffff";
        this.stackCount = 0;
        this.stackOffset = 0;
        const { startPos, endPos, startTime, endTime, type, hitSound, hitSample, comboCount, difficulty, objectIndex } = hitObjectConfig;
        this.startPos = startPos;
        this.endPos = endPos;
        this.startTime = startTime;
        this.endTime = endTime;
        this.type = type;
        this.hitSound = hitSound;
        this.hitSample = hitSample;
        this.difficulty = difficulty;
        this.objectIndex = objectIndex;
        this.comboCount = comboCount;
    }
    draw(time) { }
    update(time) { }
    getStackedStartPos() {
        return [this.startPos[0] - this.stackOffset, this.startPos[1] - this.stackOffset];
    }
    getStackedEndPos() {
        return [this.endPos[0] - this.stackOffset, this.endPos[1] - this.stackOffset];
    }
    setNewCombo() {
        this.type &= HitObjectType.NewCombo;
    }
    isNewCombo() {
        return this.type & HitObjectType.NewCombo;
    }
    isHitCircle() {
        return this.type & HitObjectType.HitCircle;
    }
    isSlider() {
        return this.type & HitObjectType.Slider;
    }
    isSpinner() {
        return this.type & HitObjectType.Spinner;
    }
    isVisibleAt(time) {
        return time >= this.startTime - this.difficulty.getPreempt() && time <= this.endTime + 150;
    }
    // How many colour(s) are skipped on the new combo
    getColourHax() {
        return ((this.type & (HitObjectType.ColorSkip1 | HitObjectType.ColorSkip2 | HitObjectType.ColorSkip3)) >> 4) + 1;
    }
}

class HitCircle extends HitObject {
    constructor(hitObjectConfig) {
        super(hitObjectConfig);
        this.drawable = new DrawableHitCircle(this);
    }
    draw(time) {
        this.drawable.draw(time);
    }
    update(time) {
        this.drawable.update(time);
    }
}

class DrawableSliderTick {
    constructor(sliderTick) {
        this.sliderTick = sliderTick;
        const slider = sliderTick.slider;
        const tickOpacity = new Easer(0);
        const tickScale = new Easer(0);
        const slideIndex = slider.getSlideIndexAt(sliderTick.time);
        const diff = slider.difficulty;
        const preempt = diff.getPreempt();
        const appearTime = slider.startTime - preempt;
        const firstTickAppearTime = slideIndex === 0 ? appearTime : slider.getSlideStartTime(slideIndex);
        let fadeStart = firstTickAppearTime + (sliderTick.time - firstTickAppearTime) / 2 - 150;
        let fadeEnd = fadeStart + 150;
        tickOpacity.addEasing(fadeStart, fadeEnd, 0, 1);
        tickOpacity.addEasing(fadeEnd, sliderTick.time, 1, 1);
        tickScale.addEasing(fadeStart, fadeEnd, 0, 1, "OutElastic");
        tickScale.addEasing(fadeEnd, sliderTick.time, 1, 1);
        this.opacity = tickOpacity;
        this.scale = tickScale;
    }
    draw(time) {
        this.opacity.time = time;
        this.scale.time = time;
    }
}
class DrawableReverseTick {
    constructor(reverseTick) {
        this.reverseTick = reverseTick;
        const slider = reverseTick.slider;
        const slideDuration = Math.floor(slider.duration / slider.slides);
        const reverseTime = reverseTick.time;
        const tickOpacity = new Easer(0);
        const tickFadeStart = reverseTime - slideDuration * 2;
        tickOpacity.addEasing(tickFadeStart, tickFadeStart + 300, 0, 1);
        tickOpacity.addEasing(tickFadeStart + 300, reverseTime, 1, 1);
        // Scale beat every 300ms
        const tickScale = new Easer(1);
        const tickStart = reverseTime - slideDuration * 2;
        const tickEnd = reverseTime;
        for (let i = tickStart; i < tickEnd; i += 300) {
            tickScale.addEasing(i, i + 300, 1, 0.6);
        }
        this.opacity = tickOpacity;
        this.scale = tickScale;
    }
    draw(time) {
        this.opacity.time = time;
        this.scale.time = time;
    }
}
class DrawableSlider extends DrawableHitObject {
    constructor(slider) {
        super();
        this.slider = slider;
        const diff = slider.difficulty;
        const fadeIn = diff.fadeIn;
        const preempt = diff.getPreempt();
        const bodyOpacity = new Easer();
        const headOpacity = new Easer();
        const appearTime = slider.startTime - preempt;
        if (diff.mods.contains(Mod.Hidden)) {
            bodyOpacity.addEasing(appearTime, appearTime + fadeIn, 0, 0.7);
            bodyOpacity.addEasing(appearTime + fadeIn, slider.endTime, 0.7, 0, "OutQuad");
            headOpacity.addEasing(appearTime, appearTime + preempt * 0.4, 0, 1);
            headOpacity.addEasing(appearTime + preempt * 0.4, appearTime + preempt * 0.7, 1, 0);
        }
        else {
            bodyOpacity.addEasing(appearTime, appearTime + fadeIn, 0, 0.7);
            bodyOpacity.addEasing(slider.endTime, slider.endTime + 150, 0.7, 0);
            headOpacity.addEasing(appearTime, appearTime + fadeIn, 0, 1);
            headOpacity.addEasing(slider.startTime, slider.startTime + 150, 1, 0);
        }
        const ballOpacity = new Easer(0);
        ballOpacity.addEasing(slider.startTime, slider.startTime + 1, 0, 1);
        ballOpacity.addEasing(slider.endTime, slider.endTime + 1, 1, 0);
        const followCircleOpacity = new Easer(0);
        const followCircleScale = new Easer(1);
        const approachCircleOpacity = new Easer(0);
        if (diff.mods.contains(Mod.Hidden)) {
            if (slider.objectIndex === 0) {
                approachCircleOpacity.addEasing(0, Math.min(fadeIn * 2, preempt), 0, 1);
                approachCircleOpacity.addEasing(Math.min(fadeIn * 2, preempt), Math.min(fadeIn * 2, preempt) * 2, 1, 0);
            }
        }
        else {
            approachCircleOpacity.addEasing(appearTime, appearTime + Math.min(fadeIn * 2, preempt), 0, 1);
            approachCircleOpacity.addEasing(appearTime + Math.min(fadeIn * 2, preempt), slider.startTime, 1, 1);
            approachCircleOpacity.addEasing(slider.startTime, slider.startTime + 150, 1, 0);
        }
        const approachCircleScale = new Easer(1);
        approachCircleScale.addEasing(appearTime, slider.startTime, 4, 1);
        approachCircleScale.addEasing(slider.startTime, slider.startTime + 100, 1, 1.05);
        this.progress = 0;
        this.progressPosition = slider.getPositionAt(0);
        this.isVisible = false;
        this.isSliding = false;
        this.isReversed = false;
        this.slideIndex = 0;
        this.bodyOpacity = bodyOpacity;
        this.headOpacity = headOpacity;
        this.ballOpacity = ballOpacity;
        this.followCircleOpacity = followCircleOpacity;
        this.followCircleScale = followCircleScale;
        this.approachCircleOpacity = approachCircleOpacity;
        this.approachCircleScale = approachCircleScale;
        this.animate("FOLLOW_START", slider.startTime);
        this.animate("FOLLOW_END", slider.endTime);
    }
    draw(time) {
        this.progress = MathHelper.Clamp((time - this.slider.startTime) / this.slider.duration, 0, 1);
        this.progressPosition = this.slider.getStackedPositionAt(time);
        this.isVisible = this.slider.isVisibleAt(time);
        this.isSliding = time >= this.slider.startTime && time <= this.slider.endTime;
        this.slideIndex = this.slider.getSlideIndexAt(time);
        this.isReversed = this.slider.getSlideDirectionAt(time) === -1;
        this.bodyOpacity.time = time;
        this.headOpacity.time = time;
        this.ballOpacity.time = time;
        this.followCircleOpacity.time = time;
        this.followCircleScale.time = time;
        this.approachCircleOpacity.time = time;
        this.approachCircleScale.time = time;
    }
    // TODO: create a proper "fadeTo" type of animation
    animate(animationType, time) {
        switch (animationType) {
            case "FOLLOW_START": {
                this.playAnimation("FOLLOW_START", this.followCircleOpacity, followStartOpacityAnim(time));
                this.playAnimation("FOLLOW_START", this.followCircleScale, followStartScaleAnim(time));
                break;
            }
            case "UNFOLLOW": {
                this.playAnimation("UNFOLLOW", this.followCircleOpacity, unfollowOpacityAnim(time));
                this.playAnimation("UNFOLLOW", this.followCircleScale, unfollowScaleAnim(time));
                break;
            }
            case "FOLLOW_END": {
                const opacity = this.followCircleOpacity;
                const scale = this.followCircleScale;
                this.playAnimation("FOLLOW_END", opacity, followerEndOpacityAnim(opacity.getValueAt(time), time));
                this.playAnimation("FOLLOW_END", scale, followerEndScaleAnim(scale.getValueAt(time), time));
                break;
            }
        }
    }
}
const followerStartSize = 1 / 1.4;
function followStartOpacityAnim(time) {
    return [Easer.CreateEasing(time, time + 450, 0, 1, "OutQuad")];
}
function followStartScaleAnim(time) {
    return [Easer.CreateEasing(time, time + 450, followerStartSize, 1, "OutQuad")];
}
function unfollowOpacityAnim(time) {
    return [Easer.CreateEasing(time, time + 250, 1, 0, "OutQuad")];
}
function unfollowScaleAnim(time) {
    return [Easer.CreateEasing(time, time + 450, 1, 2, "OutQuad")];
}
function followerEndOpacityAnim(currentOpacity, time) {
    return [Easer.CreateEasing(time, time + 150, currentOpacity, 0, "OutQuad")];
}
function followerEndScaleAnim(currentScale, time) {
    return [Easer.CreateEasing(time, time + 250, currentScale, followerStartSize, "OutQuad")];
}

class SliderTick {
    constructor(slider, time, position) {
        this.slider = slider;
        this.time = time;
        this.position = position;
        this.drawable = new DrawableSliderTick(this);
    }
}
class SliderReverseTick {
    constructor(slider, time, position, isReversed) {
        this.slider = slider;
        this.time = time;
        this.position = position;
        this.isReversed = isReversed;
        this.drawable = new DrawableReverseTick(this);
    }
}
class Slider extends HitObject {
    constructor(hitObjectConfig, sliderConfig, timing) {
        super(hitObjectConfig);
        this.timing = timing;
        this.sliderTicks = [];
        this.reverseTicks = [];
        const { curveType, curvePoints, curvePath, slides, length, edgeSounds, edgeSets } = sliderConfig;
        this.curveType = curveType;
        this.curvePoints = curvePoints;
        this.curvePath = curvePath;
        this.slides = slides;
        this.length = length;
        this.edgeSounds = edgeSounds;
        this.edgeSets = edgeSets;
        const points = this.curvePath.points;
        const s1 = points[1];
        const s2 = points[0];
        this.startAngle = Vector2.Angle(s2, s1);
        const e1 = points[points.length - 2];
        const e2 = points[points.length - 1];
        this.endAngle = Vector2.Angle(e2, e1);
        const { duration, endTime } = this.initializeTiming();
        this.duration = duration;
        this.endTime = endTime;
        this.sliderTicks = this.initializeSliderTicks();
        this.reverseTicks = this.initializeReverseTicks();
        this.drawable = new DrawableSlider(this);
    }
    initializeTiming() {
        const sliderStartTime = this.startTime;
        const timing = this.timing.getTimingAt(sliderStartTime);
        const beatLength = timing.beatLength;
        const sliderMult = this.difficulty.sliderMultiplier;
        const sliderPixelVelocity = sliderMult * 100; // sliderMult*100 pixels for every beat
        const sliderBeatCount = (this.length * this.slides) / sliderPixelVelocity;
        const sliderDuration = sliderBeatCount * beatLength;
        const duration = sliderDuration;
        const endTime = this.startTime + sliderDuration;
        return { duration, endTime };
    }
    // TODO: fix bug where ticks fall on the different places for long fast repeating slider
    initializeSliderTicks() {
        const timing = this.timing.getTimingAt(this.startTime);
        const sliderTickRate = this.difficulty.sliderTickRate;
        const sliderTickDuration = timing.beatLengthBase / sliderTickRate;
        const sliderSlideDuration = Math.floor(this.duration / this.slides);
        const tickCountPerSlide = Math.max(0, Math.ceil(sliderSlideDuration / sliderTickDuration) - 1);
        const sliderTicks = [];
        for (let i = 0; i < this.slides; i++) {
            const isReverse = i % 2 === 1;
            if (!isReverse) {
                for (let j = 0; j < tickCountPerSlide; j++) {
                    const tickTime = this.startTime + (j + 1) * sliderTickDuration + i * sliderSlideDuration;
                    const tickPos = this.getPositionAt(tickTime);
                    const tick = new SliderTick(this, tickTime, tickPos);
                    sliderTicks.push(tick);
                }
            }
            else {
                for (let j = tickCountPerSlide - 1; j >= 0; j--) {
                    const tickTime = this.startTime + sliderSlideDuration - (j + 1) * sliderTickDuration + i * sliderSlideDuration;
                    const tickPos = this.getPositionAt(tickTime);
                    const tick = new SliderTick(this, tickTime, tickPos);
                    sliderTicks.push(tick);
                }
            }
        }
        return sliderTicks;
    }
    initializeReverseTicks() {
        const reverseTicks = [];
        for (let i = 1; i < this.slides; i++) {
            const slideDuration = Math.floor(this.duration / this.slides);
            const reverseTime = this.startTime + slideDuration * i;
            const reversePos = this.getPositionAt(reverseTime);
            const sliderCurvePoints = this.curvePath.points;
            if (i % 2 === 0) {
                const p1 = sliderCurvePoints[1];
                const p2 = sliderCurvePoints[0];
                Vector2.Angle(p2, p1);
            }
            else {
                const p1 = sliderCurvePoints[sliderCurvePoints.length - 2];
                const p2 = sliderCurvePoints[sliderCurvePoints.length - 1];
                Vector2.Angle(p2, p1);
            }
            const isReversed = i % 2 === 1;
            const reverseTick = new SliderReverseTick(this, reverseTime, reversePos, isReversed);
            reverseTicks.push(reverseTick);
        }
        return reverseTicks;
    }
    draw(time) {
        this.drawable.draw(time);
        this.sliderTicks.forEach((ticks) => ticks.drawable.draw(time));
        this.reverseTicks.forEach((ticks) => ticks.drawable.draw(time));
    }
    getPositionAt(time) {
        time = MathHelper.Clamp(time, this.startTime, this.endTime);
        const slideIndex = this.getSlideIndexAt(time);
        const t1 = (time - this.startTime) / (this.duration / this.slides) - slideIndex;
        const t2 = slideIndex % 2 === 0 ? t1 : 1 - t1;
        return this.curvePath.getPointAt(t2).toTuple();
    }
    getStackedPositionAt(time) {
        const position = this.getPositionAt(time);
        return [position[0] - this.stackOffset, position[1] - this.stackOffset];
    }
    getSlideDirectionAt(time) {
        time = MathHelper.Clamp(time, this.startTime, this.endTime);
        return this.getSlideIndexAt(time) % 2 === 0 ? 1 : -1;
    }
    getSlideIndexAt(time) {
        time = MathHelper.Clamp(time, this.startTime, this.endTime);
        return Math.max(0, Math.ceil(((time - this.startTime) * this.slides) / this.duration) - 1);
    }
    getSlideStartTime(index) {
        return this.startTime + (index * this.duration) / this.slides;
    }
    getCurvePath() {
        return this.curvePath;
    }
    getStackedCurvePath() {
        const path = this.curvePath.clone();
        path.translate(-this.stackOffset, -this.stackOffset);
        return path;
    }
    getSliderTicks() {
        return this.sliderTicks;
    }
    getStackedSliderTicks() {
        const ticks = [];
        for (const tick of this.sliderTicks) {
            ticks.push(new SliderTick(this, tick.time, [tick.position[0] - this.stackOffset, tick.position[1] - this.stackOffset]));
        }
        return ticks;
    }
    getReverseTicks() {
        return this.reverseTicks;
    }
    getStackedReverseTicks() {
        const ticks = [];
        for (const tick of this.reverseTicks) {
            ticks.push(new SliderReverseTick(this, tick.time, [tick.position[0] - this.stackOffset, tick.position[1] - this.stackOffset], tick.isReversed));
        }
        return ticks;
    }
}

class DrawableSpinner {
    constructor(spinner) {
        this.spinner = spinner;
        const opacity = new Easer();
        const appearTime = spinner.startTime - spinner.difficulty.getPreempt();
        const dissapearTime = spinner.endTime + 150;
        opacity.addEasing(appearTime, spinner.startTime, 0, 1);
        opacity.addEasing(spinner.startTime, spinner.endTime, 1, 1);
        opacity.addEasing(spinner.endTime, dissapearTime, 1, 0);
        this.rpm = 0;
        this.rotation = 0;
        this.meter = 0;
        this.opacity = opacity;
    }
    draw(time) {
        this.opacity.time = time;
    }
}

class Spinner extends HitObject {
    constructor(hitObjectConfig) {
        super(hitObjectConfig);
        this.drawable = new DrawableSpinner(this);
    }
    draw(time) {
        this.drawable.draw(time);
    }
}

class HitObjects {
    constructor() {
        this.objects = [];
    }
    parseStringArray(hitObjectStringArray, difficulty, timing) {
        let comboCount = 0;
        let objectIndex = 0;
        for (let hitObjectString of hitObjectStringArray) {
            const hitObjectParams = hitObjectString.split(",");
            const hitObjectType = parseInt(hitObjectParams[3]);
            // If new combo or spinner, reset the combo
            (hitObjectType & HitObjectType.NewCombo || hitObjectType & HitObjectType.Spinner) && (comboCount = 0);
            comboCount++;
            if (hitObjectType & HitObjectType.HitCircle) {
                // General Parameter
                let [x, y, time, type, hitSound] = hitObjectParams.slice(0, 5).map(Number);
                // Flip Vertically on HardRock Mod
                if (difficulty.mods.contains(Mod.HardRock)) {
                    y = 384 - y;
                }
                const startPos = [x, y];
                const endPos = [x, y];
                const startTime = time;
                const endTime = time;
                // Hitsound Parameter
                const [normalSet, additionSet, index, volume, filename] = hitObjectParams[5].split(":");
                const hitSample = new Hitsample(+normalSet, +additionSet, +index, +volume, filename);
                // Add HitObject to array
                const hitObjectConfig = {
                    startPos,
                    endPos,
                    startTime,
                    endTime,
                    type,
                    hitSound,
                    hitSample,
                    comboCount,
                    difficulty,
                    objectIndex,
                };
                const hitCircle = new HitCircle(hitObjectConfig);
                this.objects.push(hitCircle);
            }
            else if (hitObjectType & HitObjectType.Slider) {
                // General Parameter
                let [x, y, time, type, hitSound] = hitObjectParams.slice(0, 5).map(Number);
                const startTime = time;
                const endTime = time; // will be overwritten later on applyTiming() method
                // Slider Parameter
                const [curveType, ...curvePointsStr] = hitObjectParams[5].split("|");
                const [slides, length] = hitObjectParams.slice(6, 8).map(Number);
                const curvePoints = curvePointsStr.map((curvePoint) => curvePoint.split(":").map(Number));
                // Flip Vertically on HardRock Mod
                if (difficulty.mods.contains(Mod.HardRock)) {
                    y = 384 - y;
                    curvePoints.forEach((curvePoint) => (curvePoint[1] = 384 - curvePoint[1]));
                }
                const curvePath = new Path(curveType, [[x, y]].concat(curvePoints), length);
                // Slider Position
                const startPos = [x, y];
                const endPosRaw = curvePath.points[curvePath.points.length - 1].toTuple();
                const endPos = [Math.floor(endPosRaw[0]), Math.floor(endPosRaw[1])];
                let hitSample = new Hitsample(0, 0, 0, 0, "");
                let edgeSounds = [];
                let edgeSets = [];
                // If the Hitsound Parameter exists
                if (hitObjectParams.length > 8) {
                    edgeSounds = hitObjectParams[8].split("|").map(Number);
                    edgeSets = hitObjectParams[9].split("|").map((edgeSet) => edgeSet.split(":"));
                    const [normalSet, additionSet, index, volume, filename] = hitObjectParams[10].split(":");
                    hitSample = new Hitsample(+normalSet, +additionSet, +index, +volume, filename);
                }
                // Add HitObject to array
                const hitObjectConfig = {
                    startPos,
                    endPos,
                    startTime,
                    endTime,
                    type,
                    hitSound,
                    hitSample,
                    comboCount,
                    difficulty,
                    objectIndex,
                };
                const sliderConfig = { curveType, curvePoints, curvePath, slides, length, edgeSounds, edgeSets };
                const slider = new Slider(hitObjectConfig, sliderConfig, timing);
                this.objects.push(slider);
            }
            else if (hitObjectType & HitObjectType.Spinner) {
                // General Parameter & Slider Parameter
                const [x, y, time, type, hitSound, endTime] = hitObjectParams.slice(0, 6).map(Number);
                const startPos = [x, y];
                const endPos = startPos;
                const startTime = time;
                // Hitsound Parameter
                const [normalSet, additionSet, index, volume, filename] = hitObjectParams[6].split(":");
                const hitSample = new Hitsample(+normalSet, +additionSet, +index, +volume, filename);
                // Add HitObject to array
                const hitObjectConfig = {
                    startPos,
                    endPos,
                    startTime,
                    endTime,
                    type,
                    hitSound,
                    hitSample,
                    comboCount,
                    difficulty,
                    objectIndex,
                };
                const spinner = new Spinner(hitObjectConfig);
                this.objects.push(spinner);
            }
            objectIndex++;
        }
    }
    applyColour(colour) {
        let colourIndex = 0;
        for (let hitObject of this.objects) {
            if (hitObject.isNewCombo()) {
                colourIndex = (colourIndex + hitObject.getColourHax()) % colour.length;
            }
            hitObject.colour = colour[colourIndex];
        }
    }
    // source : https://gist.githubusercontent.com/peppy/1167470/raw/a665e0774b040f7a930c436baa534b002b1c23ef/osuStacking.cs
    applyStacking(difficulty, stackLeniency) {
        const hitObjectRadius = difficulty.getObjectRadius();
        const stackOffset = hitObjectRadius / 10;
        const STACK_LENIENCE = 3;
        const stackThreshold = difficulty.getPreempt() * stackLeniency;
        // Reverse pass for stack calculation
        for (let i = this.objects.length - 1; i > 0; i--) {
            let n = i;
            let objectI = this.objects[i];
            if (objectI.stackCount != 0 || objectI.isSpinner())
                continue;
            if (objectI.isHitCircle()) {
                while (--n >= 0) {
                    const objectN = this.objects[n];
                    if (objectN.isSpinner())
                        continue;
                    if (objectI.startTime - objectN.endTime > stackThreshold)
                        break;
                    if (objectN.isSlider() && Vector2.Distance(objectN.endPos, objectI.startPos) < STACK_LENIENCE) {
                        let offset = objectI.stackCount - objectN.stackCount + 1;
                        for (let j = n + 1; j <= i; j++) {
                            if (Vector2.Distance(objectN.endPos, this.objects[j].startPos) < STACK_LENIENCE) {
                                this.objects[j].stackCount -= offset;
                            }
                        }
                        break;
                    }
                    if (Vector2.Distance(objectN.startPos, objectI.startPos) < STACK_LENIENCE) {
                        objectN.stackCount = objectI.stackCount + 1;
                        objectI = objectN;
                    }
                }
            }
            else if (objectI.isSlider()) {
                while (--n >= 0) {
                    let objectN = this.objects[n];
                    if (objectN.isSpinner())
                        continue;
                    if (objectI.startTime - objectN.startTime > stackThreshold)
                        break;
                    if (Vector2.Distance(objectN.endPos, objectI.startPos) < STACK_LENIENCE) {
                        objectN.stackCount = objectI.stackCount + 1;
                        objectI = objectN;
                    }
                }
            }
        }
        for (const object of this.objects) {
            if (object.isSpinner())
                continue;
            const stackCount = object.stackCount;
            const stackDistance = stackCount * stackOffset;
            object.stackOffset = stackDistance;
        }
    }
    getIndexNear(timestamp) {
        let mid;
        let lo = 0;
        let hi = this.objects.length - 1;
        while (hi - lo > 1) {
            mid = Math.floor((lo + hi) / 2);
            if (this.objects[mid].startTime < timestamp) {
                lo = mid;
            }
            else {
                hi = mid;
            }
        }
        if (timestamp - this.objects[lo].startTime <= this.objects[hi].startTime - timestamp) {
            return lo;
        }
        return hi;
    }
}

class Metadata {
    parseStringArray(args) {
        // "key : value" String Format Parsing
        const [title, titleUnicode, artist, artistUnicode, creator, version, source, tags, beatmapId, beatmapSetId] = args.map((row) => row.replace(/.+: */g, ""));
        this.title = title || "";
        this.titleUnicode = titleUnicode || "";
        this.artist = artist || "";
        this.artistUnicode = artistUnicode || "";
        this.creator = creator || "";
        this.version = version || "";
        this.source = source || "";
        this.tags = tags || "";
        this.beatmapId = parseInt(beatmapId) || 0;
        this.beatmapSetId = parseInt(beatmapSetId) || 0;
    }
}

class Timing {
    constructor(time, _beatlength, base, meter, sampleSet, sampleIndex, volume, uninhereted, effects) {
        this.time = time;
        this.meter = meter;
        this.sampleSet = sampleSet;
        this.sampleIndex = sampleIndex;
        this.volume = volume;
        this.uninhereted = uninhereted;
        this.effects = effects;
        this.beatLengthBase = base;
        if (uninhereted) {
            this.beatLength = _beatlength;
        }
        else {
            this.beatLength = (Math.max(10, Math.min(1000, -_beatlength)) * base) / 100;
        }
    }
    get bpm() {
        return (1 / this.beatLengthBase) * 1000 * 60;
    }
}
class TimingPoints {
    constructor() {
        this.timings = [];
    }
    parseStringArray(timingStringArray) {
        let inheritedBase = 0;
        for (let timingString of timingStringArray) {
            const [time, beatLength, meter, sampleSet, sampleIndex, volume, uninherited, effects] = timingString
                .split(",")
                .map(Number);
            if (uninherited) {
                inheritedBase = beatLength;
            }
            const timing = new Timing(time, beatLength, inheritedBase, meter, sampleSet, sampleIndex, volume, uninherited, effects);
            this.timings.push(timing);
        }
    }
    getTimingAt(time) {
        let timing = this.timings[0];
        for (let i = 0; i < this.timings.length; i++) {
            if (this.timings[i].time > time) {
                break;
            }
            timing = this.timings[i];
        }
        return timing;
    }
    getInheritedTimingAt(time) {
        let timing = this.timings[0];
        for (let i = 0; i < this.timings.length; i++) {
            if (this.timings[i].time > time) {
                break;
            }
            if (!this.timings[i].uninhereted) {
                timing = this.timings[i];
            }
        }
        return timing;
    }
    getUninheritedTimingAt(time) {
        let timing = this.timings[0];
        for (let i = 0; i < this.timings.length; i++) {
            if (this.timings[i].time > time) {
                break;
            }
            if (this.timings[i].uninhereted) {
                timing = this.timings[i];
            }
        }
        return timing;
    }
}

class Beatmap {
    constructor(mapData = "", mods) {
        this.mapData = mapData;
        const { general, editor, metadata, difficulty, events, timingPoints, colours, hitObjects } = this.parseBeatmap(mods);
        this.general = general;
        this.editor = editor;
        this.metadata = metadata;
        this.difficulty = difficulty;
        this.events = events;
        this.timingPoints = timingPoints;
        this.colours = colours;
        this.hitObjects = hitObjects;
    }
    parseBeatmap(mods) {
        const general = new General();
        const editor = new Editor();
        const metadata = new Metadata();
        const difficulty = new Difficulty();
        const events = new Events();
        const timingPoints = new TimingPoints();
        const colours = new Colours();
        const hitObjects = new HitObjects();
        // Split the map data into lines
        const row = this.mapData
            .replace(/(\/\/.+)/g, "")
            .split(/\r?\n/)
            .filter((str) => str !== "");
        // Get section headers index/row
        const sections = [
            "[General]",
            "[Editor]",
            "[Metadata]",
            "[Difficulty]",
            "[Events]",
            "[TimingPoints]",
            "[Colours]",
            "[HitObjects]",
        ];
        const sectionsIndex = sections.map((section) => row.findIndex((str) => str === section));
        // Split sections into their own array, and remove the section headers
        const sectionChunk = [];
        sectionsIndex.reverse().forEach((index) => {
            sectionChunk.push(row.splice(index).splice(1));
        });
        sectionChunk.reverse();
        // Parse sections into their own objects
        general.parseStringArray(sectionChunk[0]);
        editor.parseStringArray(sectionChunk[1]);
        metadata.parseStringArray(sectionChunk[2]);
        difficulty.parseStringArray(sectionChunk[3], mods);
        events.parseStringArray(sectionChunk[4]);
        timingPoints.parseStringArray(sectionChunk[5]);
        colours.parseStringArray(sectionChunk[6]);
        hitObjects.parseStringArray(sectionChunk[7], difficulty, timingPoints);
        // Set hitObjects colours and stacks
        const hexColours = colours.hex;
        hitObjects.applyColour(hexColours);
        const stackLeniency = general.stackLeniency;
        hitObjects.applyStacking(difficulty, stackLeniency);
        return { general, editor, metadata, difficulty, events, timingPoints, colours, hitObjects };
    }
    getMods() {
        return this.difficulty.mods;
    }
    setMods(mods) {
        const { general, editor, metadata, difficulty, events, timingPoints, colours, hitObjects } = this.parseBeatmap(mods);
        this.difficulty = difficulty;
        this.hitObjects = hitObjects;
    }
    getBackgroundFileNames() {
        const backgroundNames = [];
        this.events.events.forEach((event) => {
            if (event.eventType === "background") {
                backgroundNames.push(event.filename);
            }
        });
        return backgroundNames;
    }
    getAudioFilename() {
        return this.general.audioFilename;
    }
}

class ReplayTale {
    constructor(replaytaleConfig) {
        this.beatmap = null;
        this.replay = null;
        this.isModsOverriden = false;
        this.mods = null;
        this.isPaused = true;
        this.timestamp = 0;
        this._playbackRate = 1;
        this._autoSyncCount = 0;
        this._autoSyncLastTime = 0;
        this.lastFrameTimestamp = 0;
        this.loop = (time) => {
            if (this.isPaused)
                return;
            let deltaTime = time - this.lastFrameTimestamp;
            this.timestamp += deltaTime * this.playbackRate;
            this.renderer.timestamp = this.timestamp;
            this.gameInstance.time = this.timestamp;
            this.lastFrameTimestamp = time;
            // Sync audio automatically if somehow the game/audio drifts
            if (Settings.get("AudioAutoSyncEnabled")) {
                const currTime = this.audioHandler.getAudioCurrentTimeMS("beatmap");
                const offset = this.audioHandler.getAudioOffsetMS("beatmap");
                const timeDiff = currTime - offset - this.timestamp;
                if (Math.abs(timeDiff) > Settings.get("AudioAutoSyncThresholdMS")) {
                    this.audioHandler.seekAudio("beatmap", this.timestamp / 1000);
                    // Check quick repeating autosync in short intervals
                    if (Settings.get("AudioAutoSyncDetectIssue")) {
                        this._autoSyncCount++;
                        if (this.timestamp - this._autoSyncLastTime > 1000) {
                            this._autoSyncCount = 0;
                        }
                        this._autoSyncLastTime = time;
                    }
                }
            }
            if (this._autoSyncCount > 10) {
                console.warn("[Audio] Auto sync issue detected! Disabling audio auto sync!");
                Settings.set("AudioAutoSyncEnabled", false);
                this._autoSyncCount = 0;
            }
            requestAnimationFrame(this.loop);
        };
        const { container } = replaytaleConfig;
        this.renderer = new Renderer(container);
        this.audioHandler = new AudioHandler();
        this.gameInstance = new GameInstance(this.renderer);
    }
    get playbackRate() {
        return this._playbackRate;
    }
    set playbackRate(value) {
        this._playbackRate = value;
        this.audioHandler.setAudioOptions("beatmap", { playbackRate: value });
    }
    loadBeatmapAssets(audio, background) {
        if (audio !== undefined) {
            const volume = Settings.get("AudioVolume");
            const offset = Settings.get("AudioOffset");
            this.audioHandler.loadAudio("beatmap", audio, { volume: volume / 100, offsetMS: offset });
            Settings.addUpdateListener("AudioVolume", (volume) => {
                this.audioHandler.setAudioOptions("beatmap", { volume: volume / 100 });
            });
            Settings.addUpdateListener("AudioOffset", (offset) => {
                this.audioHandler.setAudioOptions("beatmap", { offsetMS: offset });
            });
        }
        if (background !== undefined) {
            this.renderer.setBackground(background);
        }
    }
    loadBeatmap(beatmap) {
        if (this.mods !== null) {
            beatmap.setMods(this.mods);
        }
        if (this.mods === null && this.replay && this.replay.mods.numeric !== beatmap.getMods().numeric) {
            const mods = this.replay.mods;
            beatmap.setMods(mods);
        }
        this.beatmap = beatmap;
        this.gameInstance.loadBeatmap(beatmap);
        this.renderer.loadBeatmap(beatmap);
    }
    loadReplay(replay) {
        this._replayModsNumeric = replay.mods.numeric;
        if (this.mods !== null) {
            replay.mods = this.mods;
        }
        if (this.beatmap && this.beatmap.getMods().numeric !== replay.mods.numeric) {
            this.beatmap.setMods(replay.mods);
        }
        this.replay = replay;
        this.gameInstance.loadReplay(replay);
        this.renderer.loadReplay(replay);
    }
    enableModsOverride(mods) {
        //console.log(`Enabling Overrides : ${mods.list}`);
        var _a;
        this.isModsOverriden = true;
        if (mods.numeric === ((_a = this.mods) === null || _a === void 0 ? void 0 : _a.numeric)) {
            return;
        }
        this.mods = mods;
        this.replay && (this.replay.mods = mods);
        if (this.beatmap) {
            const oldMods = this.beatmap.getMods().numeric;
            this.beatmap.setMods(mods);
            if (oldMods !== mods.numeric) {
                this.renderer.loadBeatmap(this.beatmap);
            }
        }
    }
    disableModsOverride() {
        //console.log(`Disabling Overrides! Previous Beatmap Mods : ${this.beatmap?.getMods().list}`);
        this.mods = null;
        if (this._replayModsNumeric === null) {
            return;
        }
        const oldReplayMods = new Mods(this._replayModsNumeric);
        this.replay && (this.replay.mods = oldReplayMods);
        if (this.beatmap) {
            const oldMapMods = this.beatmap.getMods().numeric;
            this.beatmap.setMods(oldReplayMods);
            if (oldMapMods !== oldReplayMods.numeric) {
                this.renderer.loadBeatmap(this.beatmap);
            }
        }
    }
    play() {
        this.isPaused = false;
        this.lastFrameTimestamp = performance.now();
        this.audioHandler.playAudio("beatmap");
        this.audioHandler.seekAudio("beatmap", this.timestamp / 1000);
        this.loop(this.lastFrameTimestamp);
    }
    pause() {
        this.isPaused = true;
        this.audioHandler.pauseAudio("beatmap");
    }
    seek(timestamp) {
        this.timestamp = timestamp;
        this.renderer.timestamp = timestamp;
        this.audioHandler.seekAudio("beatmap", timestamp / 1000);
    }
}

export { Beatmap, Mod, Mods, Replay, ReplayData, ReplayNode, Settings, ReplayTale as default };
//# sourceMappingURL=obviewer.js.map
