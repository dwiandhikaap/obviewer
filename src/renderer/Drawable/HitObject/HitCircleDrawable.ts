import { Container, Sprite, Text, TextStyle, Texture, Ticker } from "pixi.js";
import { Difficulty } from "../../../osu/Beatmap/BeatmapAttributes/Difficulty";
import { HitCircle } from "../../../osu/Beatmap/BeatmapAttributes/HitObjects/HitCircle";
import { hexToInt } from "../../../util/color";
import { AssetsLoader } from "../../Assets/Assets";

class HitCircleDrawable extends Container {
    private radius: number;

    private circle: Container;
    private approachCircle: Sprite;

    private assets = AssetsLoader.assets;

    constructor(private hitCircle: HitCircle, difficulty: Difficulty, private renderScale: number) {
        super();

        const startPos = hitCircle.getStackedStartPos();
        const x = startPos[0] * renderScale;
        const y = startPos[1] * renderScale;

        this.radius = difficulty.getObjectRadius() * renderScale;

        this.circle = this.createCircle();
        this.approachCircle = this.createApproachCircle();

        this.addChild(this.circle);
        this.addChild(this.approachCircle);

        this.position.set(x, y);
    }

    private createCircle() {
        const { radius, hitCircle, renderScale } = this;
        const { comboCount, colour } = hitCircle;
        const texture = (this.assets["hitcircle"].texture || Texture.EMPTY).clone();
        texture.baseTexture.setSize(radius * 2, radius * 2);

        const hitCircleSprite = new Sprite(texture);
        hitCircleSprite.tint = hexToInt(colour);
        hitCircleSprite.anchor.set(0.5, 0.5);

        const hcOverlayTexture = (this.assets["hitcircleoverlay"].texture || Texture.EMPTY).clone();
        hcOverlayTexture.baseTexture.setSize(radius * 2, radius * 2);
        const sHCOverlay = new Sprite(hcOverlayTexture);
        sHCOverlay.anchor.set(0.5, 0.5);

        const style = new TextStyle({
            fill: "white",
            fontSize: 28 * renderScale,
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

    private createApproachCircle() {
        const texture = (this.assets["approachcircle"].texture || Texture.EMPTY).clone();
        texture.baseTexture.setSize(this.radius * 2, this.radius * 2);
        const ac = new Sprite(texture);
        ac.anchor.set(0.5, 0.5);

        return ac;
    }

    update(timestamp: number) {
        this.visible = this.hitCircle.isVisibleAt(timestamp);
        if (!this.visible) return;

        this.hitCircle.updateState(timestamp, false);

        const { opacity, approachCircleScale, approachCircleOpacity } = this.hitCircle.state;

        this.circle.alpha = opacity.value;

        this.approachCircle.scale.set(approachCircleScale.value, approachCircleScale.value);
        this.approachCircle.alpha = approachCircleOpacity.value;
    }
}

export { HitCircleDrawable };
