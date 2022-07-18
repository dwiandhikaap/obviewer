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

function createSliderHead(slider: Slider, textureScale: number) {
    const color = hexToInt(slider.colour);
    const count = slider.comboCount;

    const hitTexture = AssetsLoader.instance.getTexture("hitcircle");
    const hitSprite = new Sprite(hitTexture);
    hitSprite.tint = color;
    hitSprite.anchor.set(0.5);
    hitSprite.scale.set(textureScale);

    const overlayTexture = AssetsLoader.instance.getTexture("hitcircleoverlay");
    const overlaySprite = new Sprite(overlayTexture);
    overlaySprite.anchor.set(0.5, 0.5);
    overlaySprite.scale.set(textureScale);

    const style = new TextStyle({
        fill: "white",
        fontSize: textureScale * 56,
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

function createSliderBall(textureScale: number) {
    const texture = AssetsLoader.instance.getTexture("sliderb0");
    const sliderBall = new Sprite(texture);
    sliderBall.anchor.set(0.5, 0.5);

    sliderBall.scale.set(textureScale);
    sliderBall.alpha = 0;

    return sliderBall;
}

function createSliderFollower(textureScale: number) {
    const texture = AssetsLoader.instance.getTexture("sliderfollowcircle");
    const sliderFollower = new Sprite(texture);

    sliderFollower.anchor.set(0.5, 0.5);
    sliderFollower.scale.set(textureScale);

    const sliderFollowerContainer = new Container();
    sliderFollowerContainer.alpha = 0;
    sliderFollowerContainer.addChild(sliderFollower);

    return sliderFollowerContainer;
}

function createApproachCircle(textureScale: number) {
    const texture = AssetsLoader.instance.getTexture("approachcircle");
    const approachCircle = new Sprite(texture);

    approachCircle.scale.set(textureScale);
    approachCircle.anchor.set(0.5, 0.5);

    const approachCircleContainer = new Container();
    approachCircleContainer.addChild(approachCircle);

    return approachCircleContainer;
}

function createSliderReverses(slider: Slider, textureScale: number, fieldScale: number) {
    const stackedSliderReverses = slider.getStackedReverseTicks();
    const sliderReverses = new Container();

    for (const sliderReverse of stackedSliderReverses) {
        const reverseTexture = AssetsLoader.instance.getTexture("reversearrow");
        const reverse = new Sprite(reverseTexture);

        reverse.scale.set(textureScale);
        reverse.anchor.set(0.5);

        const relativePos = [
            (sliderReverse.position[0] - slider.startPos[0]) * fieldScale,
            (sliderReverse.position[1] - slider.startPos[1]) * fieldScale,
        ];

        const reverseContainer = new Container();
        reverseContainer.addChild(reverse);
        reverseContainer.position.set(relativePos[0], relativePos[1]);
        reverseContainer.rotation = sliderReverse.isReversed ? slider.endAngle : slider.startAngle;

        sliderReverses.addChild(reverseContainer);
    }

    return sliderReverses;
}

function createSliderTicks(slider: Slider, textureScale: number, fieldScale: number) {
    const stackedSliderTicks = slider.getStackedSliderTicks();
    const tickTexture = AssetsLoader.instance.getTexture("sliderscorepoint");

    const sliderTicks = new Container();

    for (const sliderTick of stackedSliderTicks) {
        const tick = new Sprite(tickTexture);
        tick.scale.set(textureScale);
        tick.anchor.set(0.5, 0.5);

        const relativeTickPos = [
            (sliderTick.position[0] - slider.getStackedStartPos()[0]) * fieldScale,
            (sliderTick.position[1] - slider.getStackedStartPos()[1]) * fieldScale,
        ];

        const tickContainer = new Container();
        tickContainer.addChild(tick);
        tickContainer.position.set(relativeTickPos[0], relativeTickPos[1]);
        sliderTicks.addChild(tickContainer);
    }

    return sliderTicks;
}

class DrawableSlider extends Container {
    private textureScale: number;
    private linePath: Path;

    private sliderApproachCircle: Container;
    private sliderBody: Sprite;
    private sliderHead: Container;
    private sliderBall: Sprite;
    private sliderFollower: Container;
    private sliderReverses: Container;
    private sliderTicks: Container;

    constructor(private slider: Slider, private fieldScale: number) {
        super();
        const startPos = slider.getStackedStartPos();
        const x = startPos[0] * fieldScale;
        const y = startPos[1] * fieldScale;

        this.linePath = slider.getStackedCurvePath();

        // https://osu.ppy.sh/wiki/en/Skinning/osu%21#hit-circles
        const hitCirclePixelRadius = slider.difficulty.getObjectRadius() * fieldScale;
        this.textureScale = hitCirclePixelRadius / 64;

        this.linePath.scale(fieldScale);
        this.linePath.translate(-this.linePath.points[0][0], -this.linePath.points[0][1]);

        this.sliderBody = createSliderBody(this.linePath, hitCirclePixelRadius);
        this.sliderApproachCircle = createApproachCircle(this.textureScale);
        this.sliderHead = createSliderHead(this.slider, this.textureScale);
        this.sliderBall = createSliderBall(this.textureScale);
        this.sliderFollower = createSliderFollower(this.textureScale);
        this.sliderReverses = createSliderReverses(this.slider, this.textureScale, this.fieldScale);
        this.sliderTicks = createSliderTicks(this.slider, this.textureScale, this.fieldScale);

        this.addChild(this.sliderBody);
        this.addChild(this.sliderReverses);
        this.addChild(this.sliderBall);
        this.addChild(this.sliderHead);
        this.addChild(this.sliderTicks);
        this.addChild(this.sliderFollower);
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
        this.sliderApproachCircle.scale.set(approachCircleScale.value);

        const ballPos = [
            (progressPosition[0] - this.slider.getStackedStartPos()[0]) * this.fieldScale,
            (progressPosition[1] - this.slider.getStackedStartPos()[1]) * this.fieldScale,
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
