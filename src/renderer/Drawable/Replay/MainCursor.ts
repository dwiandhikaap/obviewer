import { Container, Sprite } from "pixi.js";
import { Replay } from "../../../osu/Replay/Replay";
import { AssetsLoader } from "../../Assets/Assets";

const CURSOR_SCALE = 70;

class MainCursor extends Container {
    private mainCursor: Sprite;

    constructor(private replay: Replay, private renderScale: number) {
        super();

        const x = replay.replayData[0].x * renderScale;
        const y = replay.replayData[0].y * renderScale;

        this.mainCursor = this.createMainCursor();
        this.addChild(this.mainCursor);

        this.position.set(x, y);

        console.log(x, y, this.mainCursor.width, this.mainCursor.height);
    }

    private createMainCursor() {
        const texture = AssetsLoader.getTexture("main-cursor");
        const mainCursor = new Sprite(texture);
        mainCursor.width = this.renderScale * CURSOR_SCALE;
        mainCursor.height = this.renderScale * CURSOR_SCALE;
        mainCursor.anchor.set(0.5);

        return mainCursor;
    }

    update(timestamp: number) {
        const [x, y] = this.replay.replayData.getPositionAt(timestamp, true);

        this.position.set(x * this.renderScale, y * this.renderScale);
    }
}

export { MainCursor };
