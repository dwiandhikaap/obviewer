import { Container, Sprite, Text, TextStyle, Texture, Ticker } from "pixi.js";
import { Difficulty } from "../../../osu/Beatmap/BeatmapAttributes/Difficulty";
import { Slider } from "../../../osu/Beatmap/BeatmapAttributes/HitObjects/Slider";
import { hexToInt } from "../../../util/color";
import { Path } from "../../../math/Path";
import { AssetsLoader } from "../../Assets/Assets";
import { SliderTextureGenerator } from "./SliderTextureGenerator";

class SliderDrawable extends Container {
    private linePath: Path;

    private radius: number;

    private sliderApproachCircle: Sprite;
    private sliderBody: Sprite;
    private sliderHead: Container;
    private sliderBall: Sprite;
    private sliderReverses: Container;
    private sliderTicks: Container;

    constructor(private slider: Slider, difficulty: Difficulty, private renderScale: number) {
        super();
        const startPos = slider.getStackedStartPos();

        this.linePath = slider.getStackedCurvePath().clone();
        this.linePath.scale(renderScale);
        this.linePath.translate(-this.linePath.points[0][0], -this.linePath.points[0][1]);

        const x = startPos[0] * renderScale;
        const y = startPos[1] * renderScale;

        this.radius = difficulty.getObjectRadius() * renderScale;

        this.sliderApproachCircle = this.createApproachCircle();
        this.sliderBody = this.createSliderBody();
        this.sliderReverses = this.createSliderReverses();
        this.sliderTicks = this.createSliderTicks();
        this.sliderHead = this.createSliderHead();
        this.sliderBall = this.createSliderBall();

        this.addChild(this.sliderBody);
        this.addChild(this.sliderTicks);
        this.addChild(this.sliderReverses);
        this.addChild(this.sliderBall);
        this.addChild(this.sliderHead);
        this.addChild(this.sliderApproachCircle);

        this.position.set(x, y);
        this.visible = false;
    }

    private createSliderBody() {
        const points = this.linePath.points;

        let minPoint = [points[0][0], points[0][1]];
        for (let i = 1; i < points.length; i++) {
            if (points[i][0] < minPoint[0]) minPoint[0] = points[i][0];
            if (points[i][1] < minPoint[1]) minPoint[1] = points[i][1];
        }

        minPoint[0] -= this.radius;
        minPoint[1] -= this.radius;

        const sliderTexture = SliderTextureGenerator.createTexture(points, this.radius);
        const sliderSprite = new Sprite(sliderTexture);

        sliderSprite.position.set(minPoint[0], minPoint[1]);
        sliderSprite.alpha = 0.75;

        return sliderSprite;
    }

    private createSliderTicks() {
        const { slider, renderScale } = this;
        const stackedSliderTicks = slider.getStackedSliderTicks();

        const tickTexture = AssetsLoader.getTexture("sliderscorepoint");

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

    private createSliderReverses() {
        const { slider, renderScale, radius } = this;

        const stackedSliderReverses = slider.getStackedReverseTicks();
        const sliderReverses = new Container();

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

    private createSliderHead() {
        const { radius, slider, renderScale } = this;
        const { comboCount, colour } = slider;
        const color = hexToInt(colour);

        const hitcircleTexture = AssetsLoader.getTexture("hitcircle");

        const sliderHeadCircle = new Sprite(hitcircleTexture);
        sliderHeadCircle.tint = color;

        sliderHeadCircle.width = Math.ceil(radius) * 2;

        sliderHeadCircle.height = Math.ceil(radius) * 2;
        sliderHeadCircle.anchor.set(0.5, 0.5);

        const hcOverlayTexture = AssetsLoader.getTexture("hitcircleoverlay");
        const sHCOverlay = new Sprite(hcOverlayTexture);
        sHCOverlay.width = Math.ceil(radius * 2);
        sHCOverlay.height = Math.ceil(radius * 2);
        sHCOverlay.anchor.set(0.5, 0.5);

        // number part
        const style = new TextStyle({
            fill: "white",
            fontSize: 28 * renderScale,
            strokeThickness: 3,
        });
        const sliderHeadNumber = new Text(comboCount.toString(), style);
        sliderHeadNumber.anchor.set(0.5, 0.5);

        const sliderHead = new Container();
        sliderHead.addChild(sliderHeadCircle);
        sliderHead.addChild(sHCOverlay);
        sliderHead.addChild(sliderHeadNumber);

        return sliderHead;
    }

    private createSliderBall() {
        const texture = AssetsLoader.getTexture("sliderb0");
        const sliderBall = new Sprite(texture);
        sliderBall.anchor.set(0.5, 0.5);
        sliderBall.width = this.radius * 2;
        sliderBall.height = this.radius * 2;
        sliderBall.alpha = 0;

        return sliderBall;
    }

    private createApproachCircle() {
        const texture = AssetsLoader.getTexture("approachcircle");
        const approachCircle = new Sprite(texture);
        approachCircle.width = this.radius * 2;
        approachCircle.height = this.radius * 2;
        approachCircle.anchor.set(0.5, 0.5);

        return approachCircle;
    }

    update(timestamp: number) {
        const visible = this.slider.isVisibleAt(timestamp);
        this.visible = visible;
        if (!visible) return;

        this.slider.updateState(timestamp, false);

        const {
            isSliding,
            slideIndex,
            progressPosition,
            opacity,
            headOpacity,
            ballOpacity,
            approachCircleOpacity,
            approachCircleScale,
        } = this.slider.state;

        this.sliderApproachCircle.alpha = approachCircleOpacity.value;
        this.sliderApproachCircle.width = approachCircleScale.value * this.radius * 2;
        this.sliderApproachCircle.height = approachCircleScale.value * this.radius * 2;

        this.alpha = opacity.value;

        if (isSliding) {
            const ballPos = [
                (progressPosition[0] - this.slider.getStackedStartPos()[0]) * this.renderScale,
                (progressPosition[1] - this.slider.getStackedStartPos()[1]) * this.renderScale,
            ];

            this.sliderBall.transform.position.set(ballPos[0], ballPos[1]);
            this.sliderBall.alpha = ballOpacity.value;

            this.sliderHead.alpha = headOpacity.value;
        }

        const reverseIndexStart = Math.max(0, slideIndex - 1);
        const reverseIndexEnd = Math.min(this.slider.slides - 2, slideIndex + 1);

        for (let i = reverseIndexStart; i <= reverseIndexEnd; i++) {
            const reverse = this.sliderReverses.children[i];
            const opacity = this.slider.reverseTicks[i].opacity.getValueAt(timestamp);
            reverse.alpha = opacity;
        }
    }
}

export { SliderDrawable };
