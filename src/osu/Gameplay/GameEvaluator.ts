import { Beatmap } from "../Beatmap/Beatmap";
import { HitCircle, HitObject, Slider, Spinner } from "../Beatmap/BeatmapAttributes/HitObjects";
import { KeypressHitInfo } from "../Graphics/HUD/KeypressOverlay";
import { Replay } from "../Replay/Replay";
import { ReplayData } from "../Replay/ReplayData";
import { KeypressType, ReplayNode } from "../Replay/ReplayNodes";
import { cloneGameState, DEFAULT_GAMESTATE, GameState } from "./types/GameState";
import { HitCircleState, SliderState, SpinnerState } from "./types/HitObjectState";
import { HitResult } from "./types/HitResult";
import { calculateUnstableRate } from "./UnstableRate";

var CACHE_STRIDE = 20;

type StateUpdateListener = (gameState: GameState) => void;

// TODO: when a state changes, clear ALL the cache next to it
class GameEvaluator {
    private replay: Replay;
    private replayData: ReplayData;
    private beatmap: Beatmap;

    private _stateCache: GameState[] = [];
    private _latestState: GameState;

    public loadReplay(replay: Replay) {
        this.replay = replay;
        this.replayData = replay.replayData;

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

        this._stateCache[0] = firstState;
        this._latestState = firstState;

        this._initialized = true;
    }

    // state[i] = updateState(state[i-1], node[i-1])
    public requestState(stateIndex: number): GameState {
        if (!this._initialized) throw new Error("Evaluator is missing the replay or beatmap!");

        this._latestState = this._requestState(stateIndex);
        return this._latestState;
    }

    private _requestState(stateIndex: number): GameState {
        if (stateIndex === this._latestState.index) {
            return this._latestState;
        }

        if (stateIndex <= 0) {
            return this._stateCache[0];
        }

        if (stateIndex % CACHE_STRIDE === 0) {
            if (this._stateCache[stateIndex / CACHE_STRIDE] === undefined) {
                const prevState = this.requestState(stateIndex - 1);
                const prevNode = this.replayData[stateIndex - 1];
                this._stateCache[stateIndex / CACHE_STRIDE] = cloneGameState(this.updateState(prevState, prevNode));
            }

            return cloneGameState(this._stateCache[stateIndex / CACHE_STRIDE]);
        }

        const prevState = this._requestState(stateIndex - 1);
        const prevNode = this.replayData[stateIndex - 1];
        return this.updateState(prevState, prevNode);
    }

    private updateState(state: GameState, node: ReplayNode): GameState {
        state.time = node.timestamp;
        state.index++;
        state.keypressInfo = updateKeypressInfo(state.keypressInfo, node);

        const hitObjects = this.beatmap.hitObjects.objects;
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
        const objects = this.beatmap.hitObjects.objects;
        let targetHitObject: HitCircle | Slider | null = null;

        for (let i = 0; i < hitObjectStates.length; i++) {
            if (objects[i].isSpinner() || !(hitObjectStates as (HitCircleState | SliderState)[])[i].lockNextObject) continue;

            targetHitObject = objects[i] as HitCircle | Slider;
            break;
        }

        if (targetHitObject === null) {
            this._executeListeners(state);
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

        this._executeListeners(state);
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

    private _executeListeners(gameState: GameState) {
        this.listeners.forEach((listener) => {
            listener(gameState);
        });
    }
}

function hitCircleCheck(currentState: GameState, node: ReplayNode, targetHitCircle: HitCircle, visibleObjects: HitObject[]): GameState {
    const diff = targetHitCircle.difficulty;
    const [hit300, hit100, hit50] = diff.getHitWindows();

    // Missed the object? kill it!
    if (node.timestamp > targetHitCircle.startTime + hit50) {
        const objectState = currentState.hitObjectStates[targetHitCircle.objectIndex] as HitCircleState;
        objectState.hit = false;
        objectState.finished = true;
        objectState.lockNextObject = false;
        objectState.hitResult = HitResult.MISS;

        currentState.hitResultInfo.missCount++;
        return currentState;
    }

    // Object is still alive
    if (node.isPressing()) {
        const nodePos = [node.x, node.y];

        for (let i = 0; i < visibleObjects.length; i++) {
            const object = visibleObjects[i];
            const objectState = currentState.hitObjectStates[object.objectIndex] as HitCircleState | SliderState;

            if (!objectState.lockNextObject || objectState.hit || object.isSpinner() || object.objectIndex > targetHitCircle.objectIndex) {
                continue;
            }

            const isHitting = isInsideCircle(object.getStackedStartPos(), nodePos, diff.getObjectRadius());
            if (!isHitting) continue;

            // Notelock Check
            if (object.objectIndex < targetHitCircle.objectIndex) {
                objectState.notelock = true;
                break;
            }

            const deltaTime = node.timestamp - targetHitCircle.startTime;
            const targetHitCircleState = objectState as HitCircleState;

            if (targetHitCircle.objectIndex !== object.objectIndex) {
                console.warn(`[GameEvaluator] Object is not equal! ID#${targetHitCircle.objectIndex} vs ID#${object.objectIndex}`);
            }

            // Early hit causes miss
            if (deltaTime < -hit50) {
                targetHitCircleState.hit = false;
                targetHitCircleState.lockNextObject = false;
                targetHitCircleState.finished = true;
                targetHitCircleState.hitResult = HitResult.MISS;

                currentState.unstableRate.hitErrors.push({ offset: deltaTime, time: node.timestamp, result: 0 });
                currentState.hitResultInfo.missCount++;
                break;
            }

            if (Math.abs(deltaTime) < hit300) {
                targetHitCircleState.hit = true;
                targetHitCircleState.lockNextObject = false;
                targetHitCircleState.finished = true;
                targetHitCircleState.hitResult = HitResult.GREAT;

                currentState.unstableRate.hitErrors.push({ offset: deltaTime, time: node.timestamp, result: 300 });
                currentState.hitResultInfo.hit300Count++;

                break;
            } else if (Math.abs(deltaTime) < hit100) {
                targetHitCircleState.hit = true;
                targetHitCircleState.lockNextObject = false;
                targetHitCircleState.finished = true;
                targetHitCircleState.hitResult = HitResult.GOOD;

                currentState.unstableRate.hitErrors.push({ offset: deltaTime, time: node.timestamp, result: 100 });
                currentState.hitResultInfo.hit100Count++;

                break;
            } else if (Math.abs(deltaTime) < hit50) {
                targetHitCircleState.hit = true;
                targetHitCircleState.lockNextObject = false;
                targetHitCircleState.finished = true;
                targetHitCircleState.hitResult = HitResult.MEH;

                currentState.unstableRate.hitErrors.push({ offset: deltaTime, time: node.timestamp, result: 50 });
                currentState.hitResultInfo.hit50Count++;

                break;
            }
        }
    }

    return currentState;
}

function sliderHeadCheck(currentState: GameState, node: ReplayNode, targetSlider: Slider, visibleObjects: HitObject[]) {
    const resultState = cloneGameState(currentState);

    const diff = targetSlider.difficulty;
    const [hit300, hit100, hit50] = diff.getHitWindows();

    // Slider Head miss
    if (node.timestamp > targetSlider.startTime + hit50) {
        const sliderState = resultState.hitObjectStates[targetSlider.objectIndex] as SliderState;
        sliderState.lockNextObject = false;
        sliderState.sliderBreak = true;

        return resultState;
    }

    if (node.isPressing()) {
        const nodePos = [node.x, node.y];

        for (let i = 0; i < visibleObjects.length; i++) {
            const object = visibleObjects[i];
            const objectState = resultState.hitObjectStates[object.objectIndex] as HitCircleState | SliderState;

            const isHitting = isInsideCircle(object.getStackedStartPos(), nodePos, diff.getObjectRadius());

            // Ignore these type of objects
            if (
                !objectState.lockNextObject ||
                !isHitting || // Object that's not on the cursor
                object.isSpinner() || // Spinner
                object.objectIndex > targetSlider.objectIndex // Object after
            )
                continue;

            // Notelock Check
            if (object.objectIndex < targetSlider.objectIndex) {
                objectState.notelock = true;
                break;
            }

            const deltaTime = node.timestamp - targetSlider.startTime;
            const targetSliderState = objectState as SliderState;

            if (targetSlider.objectIndex !== object.objectIndex) {
                console.warn(`[GameInstance] Slider is not equal! ID#${targetSlider.objectIndex} vs ID#${object.objectIndex}`);
            }

            // Early hit causes miss
            if (deltaTime < -hit50) {
                targetSliderState.lockNextObject = false;
                targetSliderState.sliderBreak = true;
                break;
            } else {
                targetSliderState.lockNextObject = false;
                targetSliderState.accuracy += calcSliderAccIncrement(targetSlider);
            }
        }
    }

    return resultState;
}

function sliderUpdate(currentState: GameState, node: ReplayNode, slider: Slider) {
    const sliderState = currentState.hitObjectStates[slider.objectIndex] as SliderState;

    if (node.isPressing()) {
        const nodeTime = node.timestamp;
        const slidePos = slider.getStackedPositionAt(node.timestamp);
        let slideRadius = slider.difficulty.getObjectRadius();

        const isSliding = isInsideCircle(slidePos, [node.x, node.y], slideRadius);

        if (isSliding) {
            slideRadius = slider.difficulty.getObjectRadius() * 2.4;
        }
    }
}

function spinnerUpdate(currentState: GameState, node: ReplayNode, spinner: Spinner) {}

// slider head + slider end + sldier ticks + slider reverses
function calcSliderAccIncrement(slider: Slider) {
    const sliderTickCount = slider.getStackedSliderTicks().length;
    const sliderReverseCount = slider.getStackedReverseTicks().length;
    const sliderElementCount = 2 + sliderTickCount + sliderReverseCount;
    return 1 / sliderElementCount;
}

function isInsideCircle(center: number[], point: number[], radius: number) {
    const dx = point[0] - center[0];
    const dy = point[1] - center[1];

    return dx * dx + dy * dy <= radius * radius;
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
