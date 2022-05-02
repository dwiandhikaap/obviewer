import { MathHelper } from "../../../math/MathHelper";
import { HitCircle, HitObject } from "../../Beatmap/BeatmapAttributes/HitObjects";
import { ReplayNode } from "../../Replay/ReplayNodes";
import { GameState } from "../types/GameState";
import { HitCircleState, SliderState } from "../types/HitObjectState";
import { HitResult } from "../types/HitResult";

export function hitCircleCheck(
    currentState: GameState,
    node: ReplayNode,
    targetHitCircle: HitCircle,
    visibleObjects: HitObject[]
): GameState {
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

            if (
                !objectState.lockNextObject ||
                objectState.hit ||
                object.isSpinner() ||
                object.objectIndex > targetHitCircle.objectIndex
            ) {
                continue;
            }

            const isHitting = MathHelper.InsideCircle(object.getStackedStartPos(), nodePos, diff.getObjectRadius());
            if (!isHitting) continue;

            // Notelock Check
            if (object.objectIndex < targetHitCircle.objectIndex) {
                objectState.notelock = true;
                break;
            }

            const deltaTime = node.timestamp - targetHitCircle.startTime;
            const targetHitCircleState = objectState as HitCircleState;

            if (targetHitCircle.objectIndex !== object.objectIndex) {
                console.warn(
                    `[GameEvaluator] Object is not equal! ID#${targetHitCircle.objectIndex} vs ID#${object.objectIndex}`
                );
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
