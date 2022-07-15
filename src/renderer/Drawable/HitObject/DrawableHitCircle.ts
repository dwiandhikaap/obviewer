import { Container, Sprite, Text, TextStyle } from "pixi.js";
import { HitCircle } from "../../../osu/Beatmap/BeatmapAttributes/HitObjects/HitCircle";
import { hexToInt } from "../../../util/color";
import { AssetsLoader } from "../../../assets/Assets";

function createCircle(hitCircle: HitCircle, radius: number) {
    const { comboCount, colour } = hitCircle;
    const texture = AssetsLoader.instance.getTexture("hitcircle");

    const hitCircleSprite = new Sprite(texture);
    hitCircleSprite.width = radius * 2;
    hitCircleSprite.height = radius * 2;
    hitCircleSprite.tint = hexToInt(colour);
    hitCircleSprite.anchor.set(0.5, 0.5);

    const hcOverlayTexture = AssetsLoader.instance.getTexture("hitcircleoverlay");
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

function createApproachCircle(radius: number) {
    const texture = AssetsLoader.instance.getTexture("approachcircle");
    const ac = new Sprite(texture);
    ac.width = radius * 2;
    ac.height = radius * 2;
    ac.anchor.set(0.5, 0.5);

    return ac;
}

class DrawableHitCircle extends Container {
    private radius: number;

    private circle: Container;
    private approachCircle: Sprite;

    private origin: [number, number];

    constructor(private hitCircle: HitCircle, renderScale: number) {
        super();

        const startPos = hitCircle.getStackedStartPos();
        const x = startPos[0] * renderScale;
        const y = startPos[1] * renderScale;
        this.origin = [x, y];
        this.radius = hitCircle.difficulty.getObjectRadius() * renderScale;

        this.circle = createCircle(hitCircle, this.radius);
        this.approachCircle = createApproachCircle(this.radius);

        this.addChild(this.circle);
        this.addChild(this.approachCircle);

        this.position.set(x, y);
        this.visible = false;
    }

    draw(timestamp: number) {
        const visible = this.hitCircle.isVisibleAt(timestamp);
        this.visible = visible;
        if (!visible) return;

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

export { DrawableHitCircle };
