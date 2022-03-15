import { Container, Graphics, Sprite } from "pixi.js";
import { Replay } from "../../../osu/Replay/Replay";
import { AssetsLoader } from "../../Assets/Assets";

const NODE_SCALE = 0.1;
const NODE_COUNT_AFTER = 7;
const NODE_COUNT_BEFORE = 7;

class CursorNode extends Container {
    private nodeSprites: Sprite[];
    private nodeLine: Graphics;

    constructor(private replay: Replay, private renderScale: number) {
        super();

        this.nodeSprites = this.createCursorNodes();
        this.nodeLine = new Graphics();

        this.addChild(this.nodeLine);
        this.nodeSprites.forEach((nodeSprite) => this.addChild(nodeSprite));
        this.visible = true;
    }

    private createCursorNodes() {
        const nodeSprites: Sprite[] = [];
        for (let i = 0; i < NODE_COUNT_BEFORE + NODE_COUNT_AFTER + 1; i++) {
            const texture = AssetsLoader.getTexture("cursornode");

            const sprite = new Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.scale.set(this.renderScale * NODE_SCALE);
            nodeSprites.push(sprite);
        }

        return nodeSprites;
    }

    update(timestamp: number) {
        const index = this.replay.replayData.getIndexNear(timestamp);
        const indexStart = Math.max(0, index - NODE_COUNT_BEFORE);
        const indexEnd = Math.min(this.replay.replayData.length - 1, index + NODE_COUNT_AFTER);
        const count = indexEnd - indexStart + 1;

        for (let i = indexStart; i <= indexEnd; i++) {
            const node = this.replay.replayData[i];
            const nodeSprite = this.nodeSprites[i - indexStart];

            const alpha = 1 - (Math.abs(index - i) / count) * 2;

            if (node.isPressingK1() || node.isPressingM1()) {
                nodeSprite.tint = 0xffff00;
            } else if (node.isPressingK2() || node.isPressingM2()) {
                nodeSprite.tint = 0xff00ff;
            }

            nodeSprite.alpha = alpha;
            nodeSprite.position.set(node.x * this.renderScale, node.y * this.renderScale);
        }

        const line = this.nodeLine;
        line.clear();
        line.lineStyle({ color: 0xffffff, width: 2 * this.renderScale });
        for (let i = 0; i < count - 1; i++) {
            const curr = this.nodeSprites[i];
            const next = this.nodeSprites[i + 1];

            const startPos = [curr.x, curr.y];
            const endPos = [next.x, next.y];

            line.lineStyle({
                color: 0xffffff,
                width: 2 * this.renderScale,
                alpha: 1 - (Math.abs(i - count / 2) / count) * 2,
            });

            line.moveTo(startPos[0], startPos[1]).lineTo(endPos[0], endPos[1]);
        }
    }
}

export { CursorNode };
