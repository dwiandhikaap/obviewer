import { Container, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { Spinner } from "../../../osu/Beatmap/BeatmapAttributes/HitObjects";
import { calculateFitRatio } from "../../../util/osu-calculation";
import { AssetsLoader } from "../../Assets/Assets";
import { Drawable } from "../DrawableTypes";

// the ultimate hack of all time
const SPINNER_BACKGROUND_SCALE = 1.05;
const SPINNER_CIRCLE_SCALE = 0.8;
const SPINNER_SPIN_SCALE = 0.175;

function createSpinnerBackground(renderScale: number) {
    const texture = AssetsLoader.getTexture("spinner-background");

    const playfieldWidth = 512 * renderScale;
    const playfieldHeight = 384 * renderScale;

    const ratio =
        SPINNER_BACKGROUND_SCALE *
        (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));

    const sprite = new Sprite(texture);
    sprite.scale.set(ratio);
    sprite.position.set(playfieldWidth / 2, playfieldHeight / 2);
    sprite.anchor.set(0.5);
    return sprite;
}

function createSpinnerMeter(renderScale: number) {
    const texture = AssetsLoader.getTexture("spinner-metre");

    const playfieldWidth = 512 * renderScale;
    const playfieldHeight = 384 * renderScale;

    const ratio =
        SPINNER_BACKGROUND_SCALE *
        (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));

    const sprite = new Sprite(texture);
    sprite.scale.set(ratio);
    sprite.position.set(playfieldWidth / 2, playfieldHeight / 2);
    sprite.anchor.set(0.5);

    return sprite;
}

function createSpinnerMeterMask(renderScale: number) {
    const texture = AssetsLoader.getTexture("spinner-metre");

    const playfieldWidth = 512 * renderScale;
    const playfieldHeight = 384 * renderScale;

    const ratio =
        SPINNER_BACKGROUND_SCALE *
        (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));

    const mask = new Sprite(Texture.WHITE);
    mask.y = 0;
    mask.x = 0;
    mask.width = texture.width * ratio;
    mask.height = texture.height * ratio;
    mask.position.set(playfieldWidth / 2, playfieldHeight);
    mask.anchor.set(0.5, 1.0);

    return mask;
}

function createSpinnerCircle(renderScale: number) {
    const texture = AssetsLoader.getTexture("spinner-circle");

    const playfieldWidth = 512 * renderScale;
    const playfieldHeight = 384 * renderScale;

    const ratio =
        SPINNER_CIRCLE_SCALE * (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));

    const sprite = new Sprite(texture);
    sprite.scale.set(ratio);
    sprite.position.set(playfieldWidth / 2, playfieldHeight / 2);
    sprite.anchor.set(0.5);

    return sprite;
}

function createSpinnerCounter(renderScale: number) {
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

function createSpinnerSpin(renderScale: number) {
    const texture = AssetsLoader.getTexture("spinner-spin");

    const playfieldWidth = 512 * renderScale;
    const playfieldHeight = 384 * renderScale;

    const ratio =
        SPINNER_SPIN_SCALE * (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));

    const sprite = new Sprite(texture);
    sprite.scale.set(ratio);
    sprite.position.set(playfieldWidth / 2, (playfieldHeight * 3) / 4);
    sprite.anchor.set(0.5, 0.25);

    return sprite;
}
class DrawableSpinner extends Container implements Drawable {
    private spinnerBackground: Sprite;
    private spinnerCircle: Sprite;
    private spinnerMeter: Sprite;
    private spinnerSpin: Sprite;

    private spinnerCounter: Text;

    private spinnerMeterMask: Sprite;

    constructor(private spinner: Spinner, renderScale: number) {
        super();

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

    draw(timestamp: number) {
        const visible = this.spinner.isVisibleAt(timestamp);
        this.visible = visible;
        if (!visible) return;

        const { opacity, rotation, meter, rpm } = this.spinner.drawable;

        this.alpha = opacity.value;

        this.spinnerMeterMask.height = this.spinnerBackground.height * Math.min(Math.abs(meter), 1);

        this.spinnerCircle.rotation = rotation;
        this.spinnerCounter.text = `${Math.round(rpm)} RPM`;
    }
}

export { DrawableSpinner };
