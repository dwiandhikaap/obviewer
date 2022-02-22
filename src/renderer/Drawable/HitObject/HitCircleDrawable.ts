import { Container, Sprite, Text, TextStyle, Texture, Ticker } from "pixi.js";
import { Difficulty } from "../../../osu/Beatmap/BeatmapAttributes/Difficulty";
import { HitCircle } from "../../../osu/Beatmap/BeatmapAttributes/HitObjects/HitCircle";
import { hexToInt } from "../../../util/color";
import { AssetsLoader } from "../../Assets/Assets";

class HitCircleDrawable extends Container {
    private radius: number;

    private circle: Container;
    private approachCircle: Sprite;

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
        this.visible = false;
    }

    private createCircle() {
        const { radius, hitCircle, renderScale } = this;
        const { comboCount, colour } = hitCircle;
        const texture = AssetsLoader.getTexture("hitcircle");

        const hitCircleSprite = new Sprite(texture);
        hitCircleSprite.width = radius * 2;
        hitCircleSprite.height = radius * 2;
        hitCircleSprite.tint = hexToInt(colour);
        hitCircleSprite.anchor.set(0.5, 0.5);

        const hcOverlayTexture = AssetsLoader.getTexture("hitcircleoverlay");
        const sHCOverlay = new Sprite(hcOverlayTexture);
        sHCOverlay.width = radius * 2;
        sHCOverlay.height = radius * 2;
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
        const texture = AssetsLoader.getTexture("approachcircle");
        const ac = new Sprite(texture);
        ac.width = this.radius * 2;
        ac.height = this.radius * 2;
        ac.anchor.set(0.5, 0.5);

        return ac;
    }

    update(timestamp: number) {
        const visible = this.hitCircle.isVisibleAt(timestamp);
        this.visible = visible;
        if (!visible) return;

        this.hitCircle.updateState(timestamp, false);

        const { opacity, approachCircleScale, approachCircleOpacity } = this.hitCircle.state;

        this.circle.alpha = opacity.value;

        this.approachCircle.alpha = approachCircleOpacity.value;
        this.approachCircle.width = approachCircleScale.value * this.radius * 2;
        this.approachCircle.height = approachCircleScale.value * this.radius * 2;
    }
}

export { HitCircleDrawable };
