import { Container, Graphics, Sprite, Text, TextStyle, Texture, Ticker } from "pixi.js";
import { Difficulty } from "../../../osu/Beatmap/BeatmapAttributes/Difficulty";
import { Spinner } from "../../../osu/Beatmap/BeatmapAttributes/HitObjects";
import { calculateFitRatio, getOsuPixelScale } from "../../../util/osu-calculation";
import { AssetsLoader } from "../../Assets/Assets";

// the ultimate hack of all time
const SPINNER_BACKGROUND_SCALE = 1.05;
const SPINNER_CIRCLE_SCALE = 0.8;
const SPINNER_SPIN_SCALE = 0.175;

class SpinnerDrawable extends Container {
    private spinnerBackground: Sprite;
    private spinnerCircle: Sprite;
    private spinnerMeter: Sprite;
    private spinnerSpin: Sprite;

    private spinnerCounter: Text;

    private spinnerMeterMask: Sprite;

    private assets = AssetsLoader.assets;

    constructor(private spinner: Spinner, difficulty: Difficulty, private renderScale: number) {
        super();

        this.spinnerBackground = this.createSpinnerBackground();
        this.spinnerMeter = this.createSpinnerMeter();
        this.spinnerCircle = this.createSpinnerCircle();
        this.spinnerSpin = this.createSpinnerSpin();
        this.spinnerCounter = this.createSpinnerCounter();

        this.spinnerMeterMask = this.createSpinnerMeterMask();
        this.spinnerMeter.mask = this.spinnerMeterMask;

        this.addChild(this.spinnerMeterMask);
        this.addChild(this.spinnerBackground);
        this.addChild(this.spinnerMeter);
        this.addChild(this.spinnerCircle);
        this.addChild(this.spinnerSpin);
        this.addChild(this.spinnerCounter);
    }

    private createSpinnerBackground() {
        const texture = (this.assets["spinner-background"].texture || Texture.EMPTY).clone();

        const playfieldWidth = 512 * this.renderScale;
        const playfieldHeight = 384 * this.renderScale;

        const ratio =
            SPINNER_BACKGROUND_SCALE *
            (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));
        texture.baseTexture.setSize(texture.width * ratio, texture.height * ratio);

        const sprite = new Sprite(texture);
        sprite.position.set(playfieldWidth / 2, playfieldHeight / 2);
        sprite.anchor.set(0.5);
        return sprite;
    }

    private createSpinnerMeter() {
        const texture = (this.assets["spinner-metre"].texture || Texture.EMPTY).clone();

        const playfieldWidth = 512 * this.renderScale;
        const playfieldHeight = 384 * this.renderScale;

        const ratio =
            SPINNER_BACKGROUND_SCALE *
            (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));
        texture.baseTexture.setSize(texture.width * ratio, texture.height * ratio);

        const sprite = new Sprite(texture);
        sprite.position.set(playfieldWidth / 2, playfieldHeight / 2);
        sprite.anchor.set(0.5);

        return sprite;
    }

    private createSpinnerMeterMask() {
        const texture = (this.assets["spinner-metre"].texture || Texture.EMPTY).clone();

        const playfieldWidth = 512 * this.renderScale;
        const playfieldHeight = 384 * this.renderScale;

        const mask = new Sprite(Texture.WHITE);
        mask.y = 0;
        mask.x = 200;
        mask.width = texture.width;
        mask.height = texture.height;
        mask.position.set(playfieldWidth / 2, playfieldHeight);
        mask.anchor.set(0.5, 1.0);

        return mask;
    }

    private createSpinnerCircle() {
        const texture = (this.assets["spinner-circle"].texture || Texture.EMPTY).clone();

        const playfieldWidth = 512 * this.renderScale;
        const playfieldHeight = 384 * this.renderScale;

        const ratio =
            SPINNER_CIRCLE_SCALE *
            (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));

        texture.baseTexture.setSize(texture.width * ratio, texture.height * ratio);

        const sprite = new Sprite(texture);
        sprite.position.set(playfieldWidth / 2, playfieldHeight / 2);
        sprite.anchor.set(0.5);

        return sprite;
    }

    private createSpinnerCounter() {
        const style = new TextStyle({
            fill: "white",
            fontFamily: "Comic Sans MS",
            fontSize: 18 * this.renderScale,
            fontWeight: "600",
            lineJoin: "round",
            strokeThickness: 7,
        });

        const text = new Text("0 RPM", style);

        const playfieldWidth = 512 * this.renderScale;
        const playfieldHeight = 384 * this.renderScale;

        text.position.set(playfieldWidth / 2, playfieldHeight);
        text.anchor.set(0.5, 1.0);

        return text;
    }

    private createSpinnerSpin() {
        const texture = (this.assets["spinner-spin"].texture || Texture.EMPTY).clone();

        const playfieldWidth = 512 * this.renderScale;
        const playfieldHeight = 384 * this.renderScale;

        const ratio =
            SPINNER_SPIN_SCALE *
            (1 / calculateFitRatio(texture.width, texture.height, playfieldWidth, playfieldHeight));

        texture.baseTexture.setSize(texture.width * ratio, texture.height * ratio);

        const sprite = new Sprite(texture);
        sprite.position.set(playfieldWidth / 2, (playfieldHeight * 3) / 4);
        sprite.anchor.set(0.5, 0.25);

        return sprite;
    }

    update(timestamp: number) {
        this.visible = this.spinner.isVisibleAt(timestamp);
        if (!this.visible) return;

        this.spinner.updateState(timestamp, false);

        const { opacity, rotation, meter, rpm } = this.spinner.state;

        this.alpha = opacity.value;

        this.spinnerMeterMask.height = this.spinnerBackground.height * Math.min(Math.abs(meter), 1);

        this.spinnerCircle.rotation = rotation;
        this.spinnerCounter.text = `${Math.round(rpm)} RPM`;
    }
}

export { SpinnerDrawable };
