import { Container, Text } from "pixi.js";
import { HitResultInfo, HitResultOverlay } from "../../osu/Graphics/HUD/HitResultOverlay";
import { HUDDrawProperty } from "../Layers/HUDOverlay";

var HitResultNames: { [hitType in keyof HitResultInfo]: string } = {
    missCount: "Miss",
    hit50Count: "50",
    hit100Count: "100",
    hit300Count: "300",
};

type HitResultTexts = { [key in keyof HitResultInfo]: Text };

function createHitResultTexts() {
    const result: Partial<HitResultTexts> = {};
    Object.keys(HitResultNames).forEach((key, index) => {
        const hitResultText = new Text(`${HitResultNames[key as keyof HitResultInfo]} : 0`, {
            fontFamily: "Arial",
            fontSize: 16,
            fill: 0xffffff,
            align: "left",
        });
        hitResultText.position.y = index * 20;

        result[key as keyof HitResultInfo] = hitResultText;
    });

    return result as HitResultTexts;
}

class HitResultDrawable extends Container {
    private hitResultTexts: HitResultTexts;
    private hitResultOverlay: HitResultOverlay;

    constructor(drawProperty: HUDDrawProperty) {
        super();

        const { resolution } = drawProperty;

        this.hitResultTexts = createHitResultTexts();
        (Object.keys(HitResultNames) as (keyof HitResultInfo)[]).forEach((hitType) => {
            this.addChild(this.hitResultTexts[hitType]);
        });

        // put on the middle left of the screen
        const x = 20;
        const y = resolution[1] / 2 - this.height / 2;

        this.position.set(x, y);
    }

    draw(time?: number) {
        if (this.hitResultOverlay === undefined) {
            return;
        }

        const hitResult = this.hitResultOverlay.hitResultInfo;

        (Object.keys(hitResult) as (keyof HitResultInfo)[]).forEach((hitType) => {
            this.hitResultTexts[hitType].text = `${HitResultNames[hitType]} : ${hitResult[hitType]}`;
        });
    }

    bind(hitResultOverlay: HitResultOverlay) {
        this.hitResultOverlay = hitResultOverlay;
    }
}

export { HitResultDrawable };
