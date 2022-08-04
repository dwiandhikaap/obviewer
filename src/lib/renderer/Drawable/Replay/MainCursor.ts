import { Container, Sprite } from "pixi.js";
import { Replay } from "../../../osu/Replay/Replay";
import { AssetsLoader } from "../../../assets/Assets";
import { Drawable } from "../DrawableTypes";

const CURSOR_SCALE = 70;

function createMainCursor(size: number) {
    const texture = AssetsLoader.instance.getTexture("cursor");
    const mainCursor = new Sprite(texture);
    mainCursor.width = size;
    mainCursor.height = size;
    mainCursor.anchor.set(0.5);

    return mainCursor;
}
class MainCursor extends Container implements Drawable {
    private mainCursor: Sprite;

    constructor(private replay: Replay, private fieldScale: number) {
        super();

        const x = replay.replayData[0].x * fieldScale;
        const y = replay.replayData[0].y * fieldScale;

        this.mainCursor = createMainCursor(fieldScale * CURSOR_SCALE);
        this.addChild(this.mainCursor);

        this.alpha = 1.0;

        this.position.set(x, y);
    }

    draw(timestamp: number) {
        const [x, y] = this.replay.replayData.getPositionAt(timestamp, true);

        this.position.set(x * this.fieldScale, y * this.fieldScale);
    }
}

export { MainCursor };
