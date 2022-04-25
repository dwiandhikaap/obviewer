import { Container, Graphics, Text } from "pixi.js";
import { KeypressOverlay } from "../../osu/Graphics/HUD/KeypressOverlay";
import { KeypressType } from "../../osu/Replay/ReplayNodes";
import { HSBToRGB, intToRGB, RGBToHSB, rgbToInt } from "../../util/color";
import { HUDDrawProperty } from "../Layers/HUDOverlay";

const keyNames = ["K1", "K2", "M1", "M2"];
type HitKeys = Exclude<KeypressType, "SMOKE">;

var PULSE_DURATION = 200;

var KEY_BG_COLOR = 0x5a6414;
var KEY_SIZE = 16;
var KEY_DISTANCE = 6;
var KEYNAME_SCALE = 0.5;
var KEYCOUNT_SCALE = 0.6;

function createKeyBG(resolution: [number, number], scale: number) {
    const result: Graphics[] = [];

    const canvasWidth = resolution[0];
    const canvasHeight = resolution[1];

    const rectSize = KEY_SIZE * scale;
    const rectDistance = KEY_DISTANCE * scale;

    const firstKeyPosX = canvasWidth - rectSize;
    const firstKeyPosY = canvasHeight / 2 - (3 * (rectSize + rectDistance)) / 2;

    let temp = [firstKeyPosX, firstKeyPosY];
    for (let i = 0; i < keyNames.length; i++) {
        const topLeft = [temp[0] - rectSize / 2, temp[1] - rectSize / 2];
        const bottomRight = [temp[0] + rectSize / 2, temp[1] + rectSize / 2];

        const square = new Graphics();
        square.beginFill(0xffffff);
        square.drawRect(topLeft[0], topLeft[1], bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]);

        temp[1] += rectSize + rectDistance;

        square.tint = KEY_BG_COLOR;
        result.push(square);
    }

    return {
        K1: result[0],
        K2: result[1],
        M1: result[2],
        M2: result[3],
    };
}

function createKeyCount(resolution: [number, number], scale: number) {
    const result: Text[] = [];

    const canvasWidth = resolution[0];
    const canvasHeight = resolution[1];

    const rectSize = KEY_SIZE * scale;
    const rectDistance = KEY_DISTANCE * scale;

    const firstKeyPosX = canvasWidth - rectSize * 1.75;
    const firstKeyPosY = canvasHeight / 2 - (3 * (rectSize + rectDistance)) / 2;

    let temp = [firstKeyPosX, firstKeyPosY];
    for (let i = 0; i < keyNames.length; i++) {
        const number = new Text("", {
            fill: 0xffffff,
            fontFamily: "Tahoma",
            align: "left",
            fontSize: rectSize * KEYCOUNT_SCALE,
        });

        number.position.set(temp[0], temp[1]);
        number.anchor.set(1.0, 0.5);

        temp[1] += rectSize + rectDistance;

        result.push(number);
    }

    return {
        K1: result[0],
        K2: result[1],
        M1: result[2],
        M2: result[3],
    };
}

function createKeyName(resolution: [number, number], scale: number) {
    const result: Text[] = [];

    const canvasWidth = resolution[0];
    const canvasHeight = resolution[1];

    const rectSize = KEY_SIZE * scale;
    const rectDistance = KEY_DISTANCE * scale;

    const firstKeyPosX = canvasWidth - rectSize;
    const firstKeyPosY = canvasHeight / 2 - (3 * (rectSize + rectDistance)) / 2;

    let temp = [firstKeyPosX, firstKeyPosY];
    for (let keyName of keyNames) {
        const number = new Text(keyName, {
            fill: 0xffffff,
            fontFamily: "Tahoma",
            align: "center",
            fontSize: rectSize * KEYNAME_SCALE,
        });

        number.position.set(temp[0], temp[1]);
        number.anchor.set(0.5);

        temp[1] += rectSize + rectDistance;

        result.push(number);
    }

    return {
        K1: result[0],
        K2: result[1],
        M1: result[2],
        M2: result[3],
    };
}

class KeypressDrawable extends Container {
    private keyBG: { [key in HitKeys]: Graphics };
    private keyName: { [key in HitKeys]: Text };
    private keyCount: { [key in HitKeys]: Text };

    private keypressOverlay: KeypressOverlay;

    constructor(drawProperty: HUDDrawProperty) {
        super();

        const { resolution, scale } = drawProperty;

        this.keyBG = createKeyBG(resolution, scale);
        this.keyName = createKeyName(resolution, scale);
        this.keyCount = createKeyCount(resolution, scale);

        Object.keys(this.keyBG).forEach((key) => {
            this.addChild(this.keyBG[key as HitKeys]);
        });

        Object.keys(this.keyName).forEach((key) => {
            this.addChild(this.keyName[key as HitKeys]);
        });

        Object.keys(this.keyCount).forEach((key) => {
            this.addChild(this.keyCount[key as HitKeys]);
        });
    }

    draw(time: number) {
        const overlay = this.keypressOverlay;

        Object.keys(overlay.hitCount).forEach((_key) => {
            const key = _key as HitKeys;

            if (overlay.latestPulseTime[key] === null) return;

            const pulseValue = Math.min(Math.max(0, 1 - (time - overlay.latestPulseTime[key]!) / PULSE_DURATION), 1);

            const colorHSB = RGBToHSB(...intToRGB(KEY_BG_COLOR));
            const targetBrightness = Math.min(100, colorHSB[2] + 30);
            const brightness = (targetBrightness - colorHSB[2]) * pulseValue + colorHSB[2];
            const pulseRGB = HSBToRGB(colorHSB[0], colorHSB[1], brightness);

            this.keyBG[key].tint = rgbToInt(...pulseRGB);
            this.keyCount[key].text = overlay.hitCount[key].toString();
        });
    }

    bind(keypressOverlay: KeypressOverlay) {
        this.keypressOverlay = keypressOverlay;
    }
}

export { KeypressDrawable };
