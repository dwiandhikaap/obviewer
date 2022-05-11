import { Renderer } from "../../renderer/Renderer";
import { Beatmap } from "../Beatmap/Beatmap";
import { GameHUD } from "../Graphics/HUD/GameHUD";
import { Replay } from "../Replay/Replay";
import { GameEvaluator } from "./GameEvaluator";

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
    private evaluator: GameEvaluator;

    constructor(renderer: Renderer) {
        this.renderer = renderer;

        this.gameHUD = new GameHUD(renderer);
        this.evaluator = new GameEvaluator();

        this.evaluator.addUpdateListener((state) => {
            this.gameHUD.updateKeypressOverlay(state.keypressInfo);
            this.gameHUD.updateHitResultOverlay(state.hitResultInfo);
            this.gameHUD.updateUnstableRate(state.unstableRate);
        });
    }

    public loadBeatmap(beatmap: Beatmap) {
        this.beatmap = beatmap;
        this.evaluator.loadBeatmap(beatmap);
    }

    public loadReplay(replay: Replay) {
        this.replay = replay;
        this.evaluator.loadReplay(replay);
    }

    private draw(time: number) {
        let stateIndex = this.replay.replayData.getIndexNear(time);
        this.evaluator.requestState(stateIndex);

        const hitObjects = this.beatmap.hitObjects.objects;
        for (let i = 0; i < hitObjects.length; i++) {
            hitObjects[i].draw(time);
        }
    }
}

export { GameInstance };
