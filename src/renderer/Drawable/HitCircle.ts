import { Container, Graphics, InteractionEvent, Text, TextStyle } from "pixi.js";
import { HitObject } from "./HitObject";

class HitCircle extends Container implements HitObject {
    constructor(combo: number, color: number, x: number, y: number) {
        super();

        // circle part
        const circle = new Graphics();
        circle.beginFill(color);
        circle.lineStyle(4, 0xffffff);
        circle.drawCircle(0, 0, 40);
        circle.endFill();

        circle.alpha = 0.6;

        // number part
        const style = new TextStyle({
            fill: "white",
            fontSize: 28,
            strokeThickness: 3,
        });
        const comboText = new Text((combo + 1).toString(), style);

        comboText.anchor.set(0.5, 0.5);

        this.position.set(x, y);

        this.addChild(circle);
        this.addChild(comboText);
    }
}

export { HitCircle };
