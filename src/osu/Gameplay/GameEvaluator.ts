import { Beatmap } from "../Beatmap/Beatmap";
import { HitCircle, HitObject, Slider, Spinner } from "../Beatmap/BeatmapAttributes/HitObjects";
import { KeypressHitInfo } from "../Graphics/HUD/KeypressOverlay";
import { Replay } from "../Replay/Replay";
import { KeypressType, ReplayNode } from "../Replay/ReplayNodes";
import { hitCircleCheck } from "./checkSystem/HitCircle";
import { sliderHeadCheck } from "./checkSystem/Slider";
import { sliderUpdate } from "./checkSystem/Slider";
import { spinnerUpdate } from "./checkSystem/Spinner";
import { StateHandler } from "./StateHandler";
import { DEFAULT_GAMESTATE, GameState } from "./types/GameState";
import { HitCircleState, SliderState, SpinnerState } from "./types/HitObjectState";
import { calculateUnstableRate } from "./UnstableRate";

var CACHE_STRIDE = 20;

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
            if (object.isHitCircle()) {
                const state: HitCircleState = {
                    hit: false,
                    notelock: false,

                    hitResult: null,

                    lockNextObject: true,
                    started: false,
                    finished: false,
                };

                firstState.hitObjectStates.push(state);
            } else if (object.isSlider()) {
                const state: SliderState = {
                    hit: false,
                    notelock: false,
                    accuracy: 0,

                    hitResult: null,

                    sliderBreak: false,
                    droppedSliderEnd: false,

                    lockNextObject: true,
                    started: false,
                    finished: false,
                };

                firstState.hitObjectStates.push(state);
            } else if (object.isSpinner()) {
                const state: SpinnerState = {
                    inertia: 0,
                    rpm: 0,

                    hitResult: null,

                    started: false,
                    finished: false,
                };

                firstState.hitObjectStates.push(state);
            }
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

function generateStateUpdater(replay: Replay, beatmap: Beatmap) {
    function updateState(state: GameState) {
        const node = replay.replayData[state.index];
        state.time = node.timestamp;
        state.index++;
        state.keypressInfo = updateKeypressInfo(state.keypressInfo, node);

        const hitObjects = beatmap.hitObjects.objects;
        const hitObjectPrevStates = state.hitObjectStates;

        // Gather hit objects that need to be updated
        const hitObjectUpdateList: HitObject[] = [];
        for (let i = 0; i < hitObjects.length; i++) {
            const object = hitObjects[i];
            const objectState = hitObjectPrevStates[i];

            if (!object.isVisibleAt(node.timestamp) && !(objectState.started && !objectState.finished)) continue;

            objectState.started = true;
            hitObjectUpdateList.push(object);
        }

        // Determine which object should be hit,
        // which is the first object that doesn't cause notelock (?) (except spinners)
        // this is because notelock exists
        const hitObjectStates = hitObjectPrevStates;
        const objects = beatmap.hitObjects.objects;
        let targetHitObject: HitCircle | Slider | null = null;

        for (let i = 0; i < hitObjectStates.length; i++) {
            if (objects[i].isSpinner() || !(hitObjectStates as (HitCircleState | SliderState)[])[i].lockNextObject) continue;

            targetHitObject = objects[i] as HitCircle | Slider;
            break;
        }

        if (targetHitObject === null) {
            return state;
        }

        // Start checking the hitobjects respectively for notelockable objects
        if (targetHitObject instanceof HitCircle) {
            state = hitCircleCheck(state, node, targetHitObject, hitObjectUpdateList);
        } else if (targetHitObject instanceof Slider) {
            state = sliderHeadCheck(state, node, targetHitObject, hitObjectUpdateList);
        }

        // Update the UR
        state.unstableRate.value = calculateUnstableRate(state.unstableRate.hitErrors);

        // Start updating hitobjects that has duration like spinners and sliders
        for (let i = 0; i < hitObjectUpdateList.length; i++) {
            const hitObject = hitObjectUpdateList[i];

            if (hitObject instanceof Slider) {
                // TODO: add reassignment later
                sliderUpdate(state, node, hitObject);
            } else if (hitObject instanceof Spinner) {
                spinnerUpdate(state, node, hitObject);
            }
        }

        return state;
    }

    return updateState;
}

function updateKeypressInfo(prevKeypressHitInfo: KeypressHitInfo, node: ReplayNode) {
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
