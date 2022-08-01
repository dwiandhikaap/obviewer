import { Renderer } from "../../renderer/Renderer";
import { Beatmap } from "../Beatmap/Beatmap";
import { Replay } from "../Replay/Replay";
import { FlashlightOverlay } from "./FlashlightOverlay";

export class Overlay {
    private _time: number;
    public get time(): number {
        return this._time;
    }
    public set time(time: number) {
        this._time = time;
        this.flashlightOverlay?.update(time);
    }

    flashlightOverlay: FlashlightOverlay;
    init(beatmap: Beatmap, replay: Replay) {
        this.flashlightOverlay.init(beatmap, replay);
    }

    constructor(renderer: Renderer) {
        renderer.loadOverlay(this);

        this.flashlightOverlay = new FlashlightOverlay();
    }
}
