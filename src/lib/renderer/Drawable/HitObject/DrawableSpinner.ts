import { BLEND_MODES, Container, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { Spinner } from "../../../osu/Beatmap/BeatmapAttributes/HitObjects";
import { AssetsLoader } from "../../../assets/Assets";
import { Drawable } from "../DrawableTypes";

// hack
const ADJUSTMENT_SCALE = 1 / 0.9;

function createSpinnerBackground(fieldScale: number) {
    const texture = AssetsLoader.instance.getTexture("spinner-background");

    const playfieldWidth = 512 * fieldScale;
    const playfieldHeight = 384 * fieldScale;

    const sprite = new Sprite(texture);
    sprite.scale.set(ADJUSTMENT_SCALE);
    sprite.position.set(playfieldWidth / 2, playfieldHeight / 2);
    sprite.anchor.set(0.5);
    sprite.blendMode = BLEND_MODES.MULTIPLY;
    return sprite;
}

function createSpinnerMeter(fieldScale: number) {
    const texture = AssetsLoader.instance.getTexture("spinner-metre");

    const playfieldWidth = 512 * fieldScale;
    const playfieldHeight = 384 * fieldScale;

    const sprite = new Sprite(texture);
    sprite.scale.set(ADJUSTMENT_SCALE);
    sprite.position.set(playfieldWidth / 2, (playfieldHeight - 7) / 2); // hack
    sprite.anchor.set(0.5);

    return sprite;
}

function createSpinnerMeterMask(fieldScale: number) {
    const texture = AssetsLoader.instance.getTexture("spinner-metre");

    const playfieldWidth = 512 * fieldScale;
    const playfieldHeight = 384 * fieldScale;

    const mask = new Sprite(Texture.WHITE);
    mask.width = texture.width;
    mask.height = texture.height;
    mask.y = 0;
    mask.x = 0;

    mask.position.set(playfieldWidth / 2, playfieldHeight);
    mask.anchor.set(0.5, 1.0);

    return mask;
}

function createSpinnerCircle(fieldScale: number) {
    const texture = AssetsLoader.instance.getTexture("spinner-circle");

    const playfieldWidth = 512 * fieldScale;
    const playfieldHeight = 384 * fieldScale;

    const sprite = new Sprite(texture);
    sprite.scale.set(ADJUSTMENT_SCALE);
    sprite.position.set(playfieldWidth / 2, playfieldHeight / 2);
    sprite.anchor.set(0.5);

    return sprite;
}

function createSpinnerSpin(fieldScale: number) {
    const texture = AssetsLoader.instance.getTexture("spinner-spin");

    const playfieldWidth = 512 * fieldScale;
    const playfieldHeight = 384 * fieldScale;
    const sprite = new Sprite(texture);
    sprite.scale.set(ADJUSTMENT_SCALE);
    sprite.position.set(playfieldWidth / 2, (playfieldHeight * 3) / 4);
    sprite.anchor.set(0.5, 0.25);

    return sprite;
}
class DrawableSpinner extends Container implements Drawable {
    private spinnerBackground: Sprite;
    private spinnerCircle: Sprite;
    private spinnerMeter: Sprite;
    private spinnerSpin: Sprite;

    private spinnerMeterMask: Sprite;

    constructor(private spinner: Spinner, fieldScale: number) {
        super();

        this.spinnerBackground = createSpinnerBackground(fieldScale);
        this.spinnerMeter = createSpinnerMeter(fieldScale);
        this.spinnerCircle = createSpinnerCircle(fieldScale);
        this.spinnerSpin = createSpinnerSpin(fieldScale);

        this.spinnerMeterMask = createSpinnerMeterMask(fieldScale);
        this.spinnerMeter.mask = this.spinnerMeterMask;

        this.addChild(this.spinnerMeterMask);
        this.addChild(this.spinnerBackground);
        this.addChild(this.spinnerSpin);
        this.addChild(this.spinnerCircle);
        this.addChild(this.spinnerMeter);

        this.visible = false;
    }

    draw(timestamp: number) {
        const visible = this.spinner.isVisibleAt(timestamp);
        this.visible = visible;
        if (!visible) return;

        const { opacity, fakeRotation, fakeMeter } = this.spinner.drawable;

        this.alpha = opacity.value;

        this.spinnerMeterMask.height =
            this.spinnerMeter.texture.baseTexture.realHeight * Math.min(Math.abs(fakeMeter.value), 1);

        this.spinnerCircle.rotation = fakeRotation.value;
    }
}

export { DrawableSpinner };
