import { Container, Sprite, Text, TextStyle } from "pixi.js";
import { Path } from "../../../math/Path";
import { Slider } from "../../../osu/Beatmap/BeatmapAttributes/HitObjects";
import { hexToInt } from "../../../util/color";
import { AssetsLoader } from "../../Assets/Assets";
import { SliderTextureGenerator } from "./SliderTextureGenerator";

function createSliderBody(path: Path, radius: number) {
    const points = path.points;

    let minPoint = [points[0][0], points[0][1]];
    for (let i = 1; i < points.length; i++) {
        if (points[i][0] < minPoint[0]) minPoint[0] = points[i][0];
        if (points[i][1] < minPoint[1]) minPoint[1] = points[i][1];
    }

    minPoint[0] -= radius;
    minPoint[1] -= radius;

    const texture = SliderTextureGenerator.createTexture(path.points, radius);
    const sprite = new Sprite(texture);

    sprite.position.set(minPoint[0], minPoint[1]);
    sprite.alpha = 0.8;
    return sprite;
}

function createSliderHead(slider: Slider, radius: number) {
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

function createSliderBall(radius: number) {
    const texture = AssetsLoader.getTexture("sliderb0");
    const sliderBall = new Sprite(texture);
    sliderBall.anchor.set(0.5, 0.5);
    sliderBall.width = radius * 2;
    sliderBall.height = radius * 2;
    sliderBall.alpha = 0;

    return sliderBall;
}

function createApproachCircle(radius: number) {
    const texture = AssetsLoader.getTexture("approachcircle");
    const approachCircle = new Sprite(texture);
    approachCircle.width = radius * 2;
    approachCircle.height = radius * 2;
    approachCircle.anchor.set(0.5, 0.5);

    return approachCircle;
}

function createSliderReverses(slider: Slider, radius: number) {
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

function createSliderTicks(slider: Slider, radius: number) {
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

class SliderDrawable extends Container {
    private radius: number;
    private linePath: Path;

    private sliderApproachCircle: Sprite;
    private sliderBody: Sprite;
    private sliderHead: Container;
    private sliderBall: Sprite;
    private sliderReverses: Container;
    private sliderTicks: Container;

    constructor(private slider: Slider, private renderScale: number) {
        super();
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
        this.sliderReverses = createSliderReverses(this.slider, this.radius);
        this.sliderTicks = createSliderTicks(this.slider, this.radius);

        this.addChild(this.sliderBody);
        this.addChild(this.sliderTicks);
        this.addChild(this.sliderReverses);
        this.addChild(this.sliderBall);
        this.addChild(this.sliderHead);
        this.addChild(this.sliderApproachCircle);

        this.position.set(x, y);
        this.visible = false;
    }

    draw(timestamp: number) {
        const visible = this.slider.isVisibleAt(timestamp);
        this.visible = visible;
        if (!visible) return;

        const { slideIndex, progressPosition, opacity, headOpacity, ballOpacity, approachCircleOpacity, approachCircleScale } =
            this.slider.drawProperty;

        this.alpha = opacity.value;
        this.sliderApproachCircle.alpha = approachCircleOpacity.value;
        this.sliderApproachCircle.width = approachCircleScale.value * this.radius * 2;
        this.sliderApproachCircle.height = approachCircleScale.value * this.radius * 2;

        const ballPos = [
            (progressPosition[0] - this.slider.getStackedStartPos()[0]) * this.renderScale,
            (progressPosition[1] - this.slider.getStackedStartPos()[1]) * this.renderScale,
        ];

        this.sliderBall.transform.position.set(ballPos[0], ballPos[1]);
        this.sliderBall.alpha = ballOpacity.value;
        this.sliderHead.alpha = headOpacity.value;

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
