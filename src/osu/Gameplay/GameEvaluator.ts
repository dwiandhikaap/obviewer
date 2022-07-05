import { Beatmap } from "../Beatmap/Beatmap";
import { KeypressHitInfo } from "../Graphics/HUD/KeypressOverlay";
import { Replay } from "../Replay/Replay";
import { KeypressType, ReplayNode } from "../Replay/ReplayNodes";
import { generateStateUpdater, DEFAULT_GAMESTATE, GameState } from "./GameState/";
import { StateHandler } from "./StateHandler";

type StateUpdateListener = (gameState: GameState) => void;

class GameEvaluator {
    private replay: Replay;
    private beatmap: Beatmap;

    private stateHandler: StateHandler;

    public loadReplay(replay: Replay) {
        this.replay = replay;

        if (this.beatmap !== undefined) {
            this._initialize();
        }
    }

    public loadBeatmap(beatmap: Beatmap) {
        this.beatmap = beatmap;

        if (this.replay !== undefined) {
            this._initialize();
        }
    }

    private _initialized = false;
    private _initialize() {
        if (this._initialized) return;

        const firstState: GameState = DEFAULT_GAMESTATE;

        for (const object of this.beatmap.hitObjects.objects) {
            const state = object.state;
            firstState.hitObjectStates.push(state);
        }

        const stateUpdater = generateStateUpdater(this.replay, this.beatmap);
        this.stateHandler = new StateHandler(stateUpdater);
        this._initialized = true;
    }

    public requestState(stateIndex: number): GameState {
        if (!this._initialized) throw new Error("Evaluator is missing the replay or beatmap!");

        const state = this.stateHandler.requestState(stateIndex);
        this.executeListeners(state);
        return state;
    }

    private listeners: StateUpdateListener[] = [];
    public addUpdateListener(listener: StateUpdateListener) {
        this.listeners.push(listener);
    }

    public removeUpdateListener(listener: StateUpdateListener) {
        const index = this.listeners.findIndex((val) => val === listener);
        index > -1 && this.listeners.splice(index, 1);
    }

    private executeListeners(gameState: Readonly<GameState>) {
        this.listeners.forEach((listener) => {
            listener(gameState);
        });
    }
}

export function updateKeypressInfo(prevKeypressHitInfo: KeypressHitInfo, node: ReplayNode) {
    Object.keys(prevKeypressHitInfo.hitCount).forEach((_key) => {
        const key = _key as Exclude<KeypressType, "SMOKE">;

        if (node.isPressing(key, true)) {
            prevKeypressHitInfo.hitCount[key]++;
        }

        if (node.isHolding(key, true)) {
            prevKeypressHitInfo.keypress.add(key);
        } else {
            prevKeypressHitInfo.keypress.delete(key);
        }
    });

    return prevKeypressHitInfo;
}

export { GameEvaluator };
