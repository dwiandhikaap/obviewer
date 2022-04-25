import { Application, Container } from "pixi.js";
import { Beatmap } from "../../osu/Beatmap/Beatmap";
import { GameHUD } from "../../osu/Graphics/HUD/GameHUD";
import { getOsuPixelScale } from "../../util/osu-calculation";
import { KeypressDrawable } from "../HUDOverlay/KeypressDrawable";
import { HitResultDrawable } from "../HUDOverlay/HitResultDrawable";
import { URBarDrawable } from "../HUDOverlay/URBarDrawable";

interface HUDDrawProperty {
    resolution: [number, number];
    scale: number;
}

class HUDOverlay extends Container {
    private hitOverlay: KeypressDrawable;
    private hitResult: HitResultDrawable;
    private urBar: URBarDrawable;

    private drawProperty: HUDDrawProperty = {} as HUDDrawProperty;

    constructor(private application: Application) {
        super();
        this.drawProperty = {
            resolution: [this.application.view.width, this.application.view.height],
            scale: getOsuPixelScale(this.application.view.width, this.application.view.height),
        };

        this.hitOverlay = new KeypressDrawable(this.drawProperty);
        this.hitResult = new HitResultDrawable(this.drawProperty);
        this.urBar = new URBarDrawable(this.drawProperty);

        this.addChild(this.hitResult);
        this.addChild(this.hitOverlay);
        this.addChild(this.urBar);
    }

    loadBeatmap(beatmap: Beatmap) {
        this.urBar.difficulty = beatmap.difficulty;
    }

    loadHUD(gameHUD: GameHUD) {
        this.urBar.bind(gameHUD.urBar);
        this.hitOverlay.bind(gameHUD.keypressOverlay);
        this.hitResult.bind(gameHUD.hitResultOverlay);
    }

    draw(time: number) {
        this.hitOverlay.draw(time);
        this.hitResult.draw(time);
        this.urBar.draw(time);
    }
}

export { HUDOverlay, HUDDrawProperty };
