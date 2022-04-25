import { Application, Container } from "pixi.js";
import { Replay } from "../../osu/Replay/Replay";
import { getOsuPixelScale } from "../../util/osu-calculation";
import { CursorNode, MainCursor } from "../Drawable/DrawableTypes";

class ReplayField extends Container {
    private playfieldResolution: [number, number];

    private mainCursor: MainCursor;
    private cursorNode: CursorNode;

    constructor(private application: Application) {
        super();
        const canvasWidth = this.application.view.width;
        const canvasHeight = this.application.view.height;

        const playfieldScale = 4 / 5;

        // create full 4:3 out of canvas playfieldResolution above
        if (canvasHeight > (canvasWidth / 4) * 3) {
            this.playfieldResolution = [canvasWidth * playfieldScale, (canvasWidth / 4) * 3 * playfieldScale];
        } else {
            this.playfieldResolution = [(canvasHeight / 3) * 4 * playfieldScale, canvasHeight * playfieldScale];
        }

        // center playfield
        const translateX = (canvasWidth - this.playfieldResolution[0]) / 2;
        const translateY = (canvasHeight - this.playfieldResolution[1]) / 2;
        this.position.set(translateX, translateY);
    }

    loadReplay(replay: Replay) {
        const scale = getOsuPixelScale(this.playfieldResolution[0], this.playfieldResolution[1]);

        this.mainCursor = new MainCursor(replay, scale);
        this.cursorNode = new CursorNode(replay, scale);

        this.addChild(this.cursorNode);
        this.addChild(this.mainCursor);
    }

    draw(timestamp: number) {
        this.mainCursor.draw(timestamp);
        this.cursorNode.draw(timestamp);
    }
}

export { ReplayField };
