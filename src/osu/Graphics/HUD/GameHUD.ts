import { Renderer } from "../../../renderer/Renderer";
import { UnstableRate } from "../../Gameplay/UnstableRate";
import { KeypressOverlay, KeypressHitInfo } from "./KeypressOverlay";
import { HitResultInfo, HitResultOverlay } from "./HitResultOverlay";
import { URBar } from "./URBar";

class GameHUD {
    private _time: number;
    public get time(): number {
        return this._time;
    }
    public set time(time: number) {
        this._time = time;

        this.keypressOverlay.time = time;
        this.urBar.time = time;
    }

    keypressOverlay: KeypressOverlay;
    hitResultOverlay: HitResultOverlay;
    urBar: URBar;

    constructor(private renderer: Renderer) {
        this.keypressOverlay = new KeypressOverlay();
        this.hitResultOverlay = new HitResultOverlay();
        this.urBar = new URBar();

        renderer.loadHUD(this);
    }

    updateKeypressOverlay(keypressInfo: KeypressHitInfo) {
        this.keypressOverlay.update(keypressInfo);
    }

    updateHitResultOverlay(hitResultInfo: HitResultInfo) {
        this.hitResultOverlay.update(hitResultInfo);
    }

    updateUnstableRate(unstableRate: UnstableRate) {
        this.urBar.update(unstableRate);
    }
}

export { GameHUD, KeypressOverlay, KeypressHitInfo, HitResultInfo };
