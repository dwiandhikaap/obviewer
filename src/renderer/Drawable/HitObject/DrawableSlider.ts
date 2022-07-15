import { Container, Sprite, Text, TextStyle } from "pixi.js";
import { Path } from "../../../math/Path";
import { Slider } from "../../../osu/Beatmap/BeatmapAttributes/HitObjects";
import { hexToInt } from "../../../util/color";
import { AssetsLoader } from "../../../assets/Assets";
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

    const hitTexture = AssetsLoader.instance.getTexture("hitcircle");
    const hitSprite = new Sprite(hitTexture);
    hitSprite.tint = color;
    hitSprite.width = Math.ceil(radius * 2);
    hitSprite.height = Math.ceil(radius * 2);
    hitSprite.anchor.set(0.5);

    const overlayTexture = AssetsLoader.instance.getTexture("hitcircleoverlay");
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
    const texture = AssetsLoader.instance.getTexture("sliderb0");
    const sliderBall = new Sprite(texture);
    sliderBall.anchor.set(0.5, 0.5);
    sliderBall.width = radius * 2;
    sliderBall.height = radius * 2;
    sliderBall.alpha = 0;

    return sliderBall;
}

function createSliderFollower(radius: number) {
    const texture = AssetsLoader.instance.getTexture("sliderfollowcircle");
    const sliderFollower = new Sprite(texture);
    sliderFollower.anchor.set(0.5, 0.5);
    sliderFollower.width = radius * 2;
    sliderFollower.height = radius * 2;
    sliderFollower.alpha = 0;

    return sliderFollower;
}

function createApproachCircle(radius: number) {
    const texture = AssetsLoader.instance.getTexture("approachcircle");
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
        const reverseTexture = AssetsLoader.instance.getTexture("reversearrow");
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

    const tickTexture = AssetsLoader.instance.getTexture("sliderscorepoint");
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

class DrawableSlider extends Container {
    private radius: number;
    private linePath: Path;

    private sliderApproachCircle: Sprite;
    private sliderBody: Sprite;
    private sliderHead: Container;
    private sliderBall: Sprite;
    private sliderFollower: Sprite;
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

    draw(timestamp: number) {
        const visible = this.slider.isVisibleAt(timestamp);
        this.visible = visible;
        if (!visible) return;

        const {
            progressPosition,
            bodyOpacity,
            headOpacity,
            ballOpacity,
            approachCircleOpacity,
            approachCircleScale,
            followCircleOpacity,
            followCircleScale,
        } = this.slider.drawable;

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

export { DrawableSlider };
