import { Container, Graphics, IHitArea, LINE_CAP, LINE_JOIN } from "pixi.js";
import { Path } from "../math/Path";
import { PathHelper } from "../math/PathHelper";
import { Vector2 } from "../math/Vector2";
import { HitObject } from "./HitObject";

class Slider extends Container implements HitObject {
    private linePath: Path;
    private lineTotalLength: number;
    constructor(controlPoints: Vector2[]) {
        super();
        this.interactive = true;

        // create line
        this.linePath = new Path("B", controlPoints, true);
        this.linePath.translate(-this.linePath.points[0][0], -this.linePath.points[0][1]);
        this.lineTotalLength = PathHelper.CalculateLength(this.linePath.points);

        const sliderLine = this.createLine();

        // create circle
        const circle = this.createCircle();

        this.on("pointerover", () => {
            document.body.style.cursor = "pointer";
        });

        this.on("pointerout", () => {
            document.body.style.cursor = "default";
        });

        this.addChild(sliderLine);
        this.addChild(circle);

        this.position.set(200, 200);
    }

    createLine(length = 1) {
        const points = this.linePath.points;
        const lineLength = (length / 1) * this.lineTotalLength;
        const trimmedPoints = PathHelper.TrimPath(points, lineLength);

        const sliderLine = new Graphics();

        // Draw outer part
        sliderLine.lineStyle({
            width: 35,
            color: 0xffffff,
            join: LINE_JOIN.ROUND,
            cap: LINE_CAP.ROUND,
        });

        sliderLine.moveTo(trimmedPoints[0][0], trimmedPoints[0][1]);
        for (let i = 1; i < trimmedPoints.length; i++) {
            sliderLine.lineTo(trimmedPoints[i][0], trimmedPoints[i][1]);
        }

        // Draw inner part
        sliderLine.lineStyle({
            width: 30,
            color: 0x000000,
            join: LINE_JOIN.ROUND,
            cap: LINE_CAP.ROUND,
        });

        sliderLine.moveTo(trimmedPoints[0][0], trimmedPoints[0][1]);
        for (let i = 1; i < trimmedPoints.length; i++) {
            sliderLine.lineTo(trimmedPoints[i][0], trimmedPoints[i][1]);
        }

        sliderLine.interactive = true;

        sliderLine.hitArea = {
            contains(x: number, y: number) {
                const point = new Vector2(x, y);
                for (let i = 0; i < trimmedPoints.length; i++) {
                    if (Vector2.Distance(point, trimmedPoints[i]) < 35 / 2) {
                        return true;
                    }
                }
                return false;
            },
        };

        return sliderLine;
    }

    createCircle() {
        const circle = new Graphics();
        circle.beginFill(0xf0f000);
        circle.lineStyle(4, 0xffffff);
        circle.drawCircle(0, 0, 16);
        circle.endFill();

        return circle;
    }

    setLength(value: number) {
        if (!this.children[0]) {
            return;
        }

        const sliderLine = this.createLine(value);
        const circle = this.createCircle();
        this.removeChildren();
        this.addChild(sliderLine);
        this.addChild(circle);
    }
}

export { Slider };
