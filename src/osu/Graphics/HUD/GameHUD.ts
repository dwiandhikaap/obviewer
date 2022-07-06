import { Renderer } from "../../../renderer/Renderer";

class GameHUD {
    private _time: number;
    public get time(): number {
        return this._time;
    }
    public set time(time: number) {
        this._time = time;
    }

    constructor(private renderer: Renderer) {
        renderer.loadHUD(this);
    }
}

export { GameHUD };
