import { Beatmap } from "../../Beatmap/Beatmap";
import { HitCircle, HitObject, Slider } from "../../Beatmap/BeatmapAttributes/HitObjects";
import { HitCircleState } from "../../Beatmap/BeatmapAttributes/HitObjects/HitCircle";
import { SliderState } from "../../Beatmap/BeatmapAttributes/HitObjects/Slider";
import { GameState } from "../GameState";

// Gather hit objects that need to be updated
// TODO: identitfy this function
export function getObjectsToUpdate(time: number, beatmap: Beatmap, gameState: Readonly<GameState>) {
    const hitObjects = beatmap.hitObjects.objects;
    const hitObjectPrevStates = gameState.hitObjectStates;
    const hitObjectUpdateList: HitObject[] = [];
    for (let i = 0; i < hitObjects.length; i++) {
        const object = hitObjects[i];
        const objectState = hitObjectPrevStates[i];

        if ((!object.isVisibleAt(time) && !objectState.started) || objectState.finished) continue;

        objectState.started = true;
        hitObjectUpdateList.push(object);
    }

    return hitObjectUpdateList;
}

// Determine which object should be hit FIRST,
// which is the first object that doesn't cause notelock (?) (except spinners)
// this is because notelock exists
export function getObjectToHit(beatmap: Beatmap, gameState: GameState) {
    const hitObjectStates = gameState.hitObjectStates as (HitCircleState | SliderState)[];
    const objects = beatmap.hitObjects.objects;
    let targetHitObject: HitCircle | Slider | null = null;

    for (let i = 0; i < hitObjectStates.length; i++) {
        if (objects[i].isSpinner() || !hitObjectStates[i].lockNextObject) continue;

        targetHitObject = objects[i] as HitCircle | Slider;
        break;
    }

    return targetHitObject;
}
