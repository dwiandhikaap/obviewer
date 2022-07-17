import { Application, Container } from "pixi.js";
import { Beatmap } from "../../osu/Beatmap/Beatmap";
import { GameHUD } from "../../osu/Graphics/HUD/GameHUD";
import { getPlayfieldScale } from "../../util/osu-calculation";

interface HUDDrawProperty {
    resolution: [number, number];
    scale: number;
}

class HUDOverlay extends Container {
    private drawProperty: HUDDrawProperty = {} as HUDDrawProperty;

    constructor(private application: Application) {
        super();
        this.drawProperty = {
            resolution: [this.application.view.width, this.application.view.height],
            scale: getPlayfieldScale(this.application.view.width, this.application.view.height),
        };
    }

    loadBeatmap(beatmap: Beatmap) {}

    loadHUD(gameHUD: GameHUD) {}

    draw(time: number) {}
}

export { HUDOverlay, HUDDrawProperty };
