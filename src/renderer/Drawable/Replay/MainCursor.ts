import { Container, Sprite } from "pixi.js";
import { Replay } from "../../../osu/Replay/Replay";
import { AssetsLoader } from "../../Assets/Assets";
import { Drawable } from "../DrawableTypes";

const CURSOR_SCALE = 70;

function createMainCursor(size: number) {
    const texture = AssetsLoader.getTexture("main-cursor");
    const mainCursor = new Sprite(texture);
    mainCursor.width = size;
    mainCursor.height = size;
    mainCursor.anchor.set(0.5);

    return mainCursor;
}
class MainCursor extends Container implements Drawable {
    private mainCursor: Sprite;

    constructor(private replay: Replay, private renderScale: number) {
        super();

        const x = replay.replayData[0].x * renderScale;
        const y = replay.replayData[0].y * renderScale;

        this.mainCursor = createMainCursor(renderScale * CURSOR_SCALE);
        this.addChild(this.mainCursor);

        this.alpha = 0.1;

        this.position.set(x, y);
    }

    draw(timestamp: number) {
        const [x, y] = this.replay.replayData.getPositionAt(timestamp, true);

        this.position.set(x * this.renderScale, y * this.renderScale);
    }
}

export { MainCursor };
