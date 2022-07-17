import { Container, Sprite, Text, TextStyle } from "pixi.js";
import { HitCircle } from "../../../osu/Beatmap/BeatmapAttributes/HitObjects/HitCircle";
import { hexToInt } from "../../../util/color";
import { AssetsLoader } from "../../../assets/Assets";

function createCircle(hitCircle: HitCircle, scale: number) {
    const { comboCount, colour } = hitCircle;
    const texture = AssetsLoader.instance.getTexture("hitcircle");

    const hitCircleSprite = new Sprite(texture);

    hitCircleSprite.scale.set(scale);
    hitCircleSprite.tint = hexToInt(colour);
    hitCircleSprite.anchor.set(0.5, 0.5);

    const hcOverlayTexture = AssetsLoader.instance.getTexture("hitcircleoverlay");
    const sHCOverlay = new Sprite(hcOverlayTexture);

    sHCOverlay.scale.set(scale);
    sHCOverlay.anchor.set(0.5, 0.5);

    // TODO: use font from skin instead
    const style = new TextStyle({
        fill: "white",
        fontSize: scale * 56,
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

function createApproachCircle(scale: number) {
    const texture = AssetsLoader.instance.getTexture("approachcircle");
    const ac = new Sprite(texture);

    ac.scale.set(scale);
    ac.anchor.set(0.5, 0.5);

    const acContainer = new Container();
    acContainer.addChild(ac);
    return acContainer;
}

// `textureScale`
// Ratio between the canvas pixel dimension of the circle that needs to be RENDERED
// (also accounts for circleSize property of the beatmap)
// and the "Suggested SD Size" of a hitcircle which is 128
// see https://osu.ppy.sh/wiki/en/Skinning/osu%21#hit-circles

// `fieldScale`
// Ratio between current playfield dimension and the dimension of standard osu playfield size which is 512/384
class DrawableHitCircle extends Container {
    private textureScale: number;

    private circle: Container;
    private approachCircle: Container;

    private origin: [number, number];

    constructor(private hitCircle: HitCircle, fieldScale: number) {
        super();

        const startPos = hitCircle.getStackedStartPos();
        const x = startPos[0] * fieldScale;
        const y = startPos[1] * fieldScale;
        this.origin = [x, y];

        const hitCirclePixelRadius = hitCircle.difficulty.getObjectRadius() * fieldScale;
        this.textureScale = hitCirclePixelRadius / 64;

        this.circle = createCircle(hitCircle, this.textureScale);
        this.approachCircle = createApproachCircle(this.textureScale);

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
        this.approachCircle.scale.set(approachCircleScale.value);

        this.position.x = this.origin[0] + positionOffset.x.value;
        this.position.y = this.origin[1] + positionOffset.y.value;
    }
}

export { DrawableHitCircle };
