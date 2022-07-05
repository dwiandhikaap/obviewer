import { Beatmap } from "../../Beatmap/Beatmap";
import { HitCircle, HitObject, Slider, Spinner } from "../../Beatmap/BeatmapAttributes/HitObjects";
import { Replay } from "../../Replay/Replay";
import { GameState } from ".";
import { hitCircleUpdate, sliderHeadCheck, sliderUpdate, spinnerUpdate } from "../rulesets";
import { updateKeypressInfo } from "../GameEvaluator";
import { getObjectsToUpdate, getObjectToHit } from "../rulesets/util";
import { calculateUnstableRate } from "../UnstableRate";

// Data that will be passed across hitObject(s) update every tick
export interface IObjectUpdateData {
    alreadyHit: boolean;
}

/* 
        current implementation:
            gameState[n] -> gameState[n].hitObjectStates -> clone -> mutate -> store it as gameState[n+1].hitObjectStates

        new implementation :
            gameState[n] -> gameState[n].hitObjectStates -> clone -> store it in hitObject.state -> mutate -> store it
*/

export function generateStateUpdater(replay: Replay, beatmap: Beatmap) {
    function updateState(state: GameState) {
        const node = replay.replayData[state.index];
        state.time = node.timestamp;
        state.index++;
        state.keypressInfo = updateKeypressInfo(state.keypressInfo, node);

        const objectsToUpdate = getObjectsToUpdate(node.timestamp, beatmap, state);
        const objectUpdateData: IObjectUpdateData = {
            alreadyHit: false,
        };

        for (const hitObject of objectsToUpdate) {
            hitObject.update(node.timestamp);

            if (hitObject instanceof HitCircle) {
                hitCircleUpdate(hitObject, beatmap, node, state, objectUpdateData);
            } else if (hitObject instanceof Slider) {
                sliderUpdate(hitObject, beatmap, node, state, objectUpdateData);
            } else if (hitObject instanceof Spinner) {
                //state = spinnerUpdate(state, node, hitObject);
            }
        }

        state.unstableRate.value = calculateUnstableRate(state.unstableRate.hitErrors);

        return state;
    }

    return updateState;
}

/* // Related to object notelocking and first hit stuff
function updateObjectFirstHit(node: ReplayNode, hitObject: HitObject, state: GameState, hitObjectUpdateList: HitObject[]) {
    if (hitObject instanceof HitCircle) {
        return hitCircleCheck(state, node, hitObject, hitObjectUpdateList);
    } else if (hitObject instanceof Slider) {
        return sliderHeadCheck(state, node, hitObject, hitObjectUpdateList);
    }

    return state;
} */
/*
export function generateStateUpdater2(replay: Replay, beatmap: Beatmap) {
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

        let targetHitObject: HitCircle | Slider | null = null;
        targetHitObject = getObjectToHit(beatmap, state);
        if (targetHitObject === null) {
            return state;
        }

        // Start checking the hitobjects respectively for notelockable objects
        if (targetHitObject instanceof HitCircle) {
            hitCircleUpdate(targetHitObject, beatmap, node, state);
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
                //sliderUpdate(state, node, hitObject);
            } else if (hitObject instanceof Spinner) {
                //spinnerUpdate(state, node, hitObject);
            }
        }

        return state;
    }

    return updateState;
}
*/
