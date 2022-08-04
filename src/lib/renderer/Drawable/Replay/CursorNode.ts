import { Container, Graphics, Sprite } from "pixi.js";
import { Replay } from "../../../osu/Replay/Replay";
import { AssetsLoader } from "../../../assets/Assets";
import { Drawable } from "../DrawableTypes";

const NODE_SCALE = 0.1;
const NODE_COUNT_AFTER = 0;
const NODE_COUNT_BEFORE = 0;

function createCursorNodes(size: number) {
    const nodeSprites: Sprite[] = [];
    for (let i = 0; i < NODE_COUNT_BEFORE + NODE_COUNT_AFTER + 1; i++) {
        const texture = AssetsLoader.instance.getTexture("cursornode");

        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(size);
        nodeSprites.push(sprite);
    }

    return nodeSprites;
}

class CursorNode extends Container implements Drawable {
    private nodeSprites: Sprite[];
    private nodeLine: Graphics;

    constructor(private replay: Replay, private fieldScale: number) {
        super();

        this.nodeSprites = createCursorNodes(fieldScale * NODE_SCALE);
        this.nodeLine = new Graphics();

        this.addChild(this.nodeLine);
        this.nodeSprites.forEach((nodeSprite) => this.addChild(nodeSprite));
        this.visible = true;
    }

    draw(timestamp: number) {
        const index = this.replay.replayData.getIndexNear(timestamp);
        const indexStart = Math.max(0, index - NODE_COUNT_BEFORE);
        const indexEnd = Math.min(this.replay.replayData.length - 1, index + NODE_COUNT_AFTER);
        const count = indexEnd - indexStart + 1;

        for (let i = indexStart; i <= indexEnd; i++) {
            const node = this.replay.replayData[i];
            const nodeSprite = this.nodeSprites[i - indexStart];

            let alpha = 1 - (Math.abs(index - i) / count) * 2;

            if (node.isPressing("K1") || node.isPressing("M1")) {
                nodeSprite.tint = 0xffff00;
            } else if (node.isPressing("K2") || node.isPressing("M2")) {
                nodeSprite.tint = 0xff00ff;
            } else {
                nodeSprite.tint = 0xffffff;
                nodeSprite.scale.set(this.fieldScale * NODE_SCALE);
            }

            nodeSprite.alpha = alpha;
            nodeSprite.position.set(node.x * this.fieldScale, node.y * this.fieldScale);
        }

        const line = this.nodeLine;
        line.clear();
        line.lineStyle({ color: 0xffffff, width: 2 * this.fieldScale });
        for (let i = 0; i < count - 1; i++) {
            const curr = this.nodeSprites[i];
            const next = this.nodeSprites[i + 1];

            const startPos = [curr.x, curr.y];
            const endPos = [next.x, next.y];

            line.lineStyle({
                color: 0xffffff,
                width: 2 * this.fieldScale,
                alpha: 1 - (Math.abs(i - count / 2) / count) * 2,
            });

            line.moveTo(startPos[0], startPos[1]).lineTo(endPos[0], endPos[1]);
        }
    }
}

export { CursorNode };
