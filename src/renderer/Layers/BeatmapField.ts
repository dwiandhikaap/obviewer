import { Container } from "pixi.js";
import { Beatmap } from "../../osu/Beatmap/Beatmap";

class BeatmapField extends Container {
    private _beatmap: Beatmap;

    constructor() {
        super();
    }

    loadBeatmap(beatmap: Beatmap) {
        this._beatmap = beatmap;

        // TODO : create hitObjects here!!!!
    }
}

export { BeatmapField };
