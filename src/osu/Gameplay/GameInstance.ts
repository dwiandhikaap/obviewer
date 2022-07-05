import { Renderer } from "../../renderer/Renderer";
import { Beatmap } from "../Beatmap/Beatmap";
import { GameHUD } from "../Graphics/HUD/GameHUD";
import { Replay } from "../Replay/Replay";

class GameInstance {
    private renderer: Renderer;
    private beatmap: Beatmap;
    private replay: Replay;

    private _time: number;
    public get time(): number {
        return this._time;
    }
    public set time(time: number) {
        this._time = time;

        this.gameHUD.time = time;
        this.draw(time);
    }

    private gameHUD: GameHUD;

    constructor(renderer: Renderer) {
        this.renderer = renderer;

        this.gameHUD = new GameHUD(this.renderer);
    }

    public loadBeatmap(beatmap: Beatmap) {
        this.beatmap = beatmap;
    }

    public loadReplay(replay: Replay) {
        this.replay = replay;
    }

    private draw(time: number) {
        const hitObjects = this.beatmap.hitObjects.objects;
        for (let i = 0; i < hitObjects.length; i++) {
            hitObjects[i].draw(time);
        }
    }
}

export { GameInstance };
