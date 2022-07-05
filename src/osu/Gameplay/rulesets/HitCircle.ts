import { MathHelper } from "../../../math/MathHelper";
import { Beatmap } from "../../Beatmap/Beatmap";
import { HitCircle, HitObject, Slider } from "../../Beatmap/BeatmapAttributes/HitObjects";
import { HitCircleState } from "../../Beatmap/BeatmapAttributes/HitObjects/HitCircle";
import { ReplayNode } from "../../Replay/ReplayNodes";
import { GameState } from "../GameState";
import { IObjectUpdateData } from "../GameState/generator";
import { HitResult } from "./hitResult";
import { Ruleset } from "./Ruleset";
import { getObjectToHit } from "./util";

const HITTABLE_RANGE = 400;

export const hitCircleUpdate: Ruleset<HitCircle> = (
    hitCircle: HitCircle,
    beatmap: Beatmap,
    node: ReplayNode,
    gameState: GameState,
    objectUpdateData: IObjectUpdateData
) => {
    const diff = beatmap.difficulty;
    const [hit300, hit100, hit50] = diff.getHitWindows();
    const objectState = gameState.hitObjectStates[hitCircle.objectIndex] as HitCircleState;

    // Miss check because no hit
    if (node.timestamp - hitCircle.startTime > hit50 && !objectState.hit) {
        objectState.finished = true;
        objectState.lockNextObject = false;
        objectState.hitResult = HitResult.MISS;

        gameState.hitResultInfo.missCount++;
        return;
    }

    if (!node.isPressing() || objectUpdateData.alreadyHit) return;

    if (MathHelper.InsideCircle(hitCircle.startPos, [node.x, node.y], diff.getObjectRadius())) {
        applyHitting(hitCircle, beatmap, node, gameState);
        objectUpdateData.alreadyHit = true;
    }

    return;
};

function applyHitting(hitCircle: HitCircle, beatmap: Beatmap, node: ReplayNode, gameState: GameState) {
    const deltaTime = node.timestamp - hitCircle.startTime;
    const [hit300, hit100, hit50] = hitCircle.difficulty.getHitWindows();
    const hitCircleState = gameState.hitObjectStates[hitCircle.objectIndex] as HitCircleState;

    // Prev HitObject Notelock check
    if (hitCircle !== getObjectToHit(beatmap, gameState) || deltaTime < -HITTABLE_RANGE) {
        hitCircle.drawable.animate("SHAKE", node.timestamp);
        return;
    }

    // Early hit causes miss
    if (deltaTime < -hit50) {
        hitCircleState.hit = true;
        hitCircleState.lockNextObject = false;
        hitCircleState.finished = true;
        hitCircleState.hitResult = HitResult.MISS;

        hitCircle.drawable.animate("MISS", node.timestamp);

        gameState.hitResultInfo.missCount++;
    }

    if (Math.abs(deltaTime) < hit300) {
        hitCircleState.hit = true;
        hitCircleState.lockNextObject = false;
        hitCircleState.finished = true;
        hitCircleState.hitResult = HitResult.GREAT;

        hitCircle.drawable.animate("HIT", node.timestamp);

        gameState.unstableRate.hitErrors.push({ offset: deltaTime, time: node.timestamp, result: 300 });
        gameState.hitResultInfo.hit300Count++;
    } else if (Math.abs(deltaTime) < hit100) {
        hitCircleState.hit = true;
        hitCircleState.lockNextObject = false;
        hitCircleState.finished = true;
        hitCircleState.hitResult = HitResult.GOOD;

        hitCircle.drawable.animate("HIT", node.timestamp);

        gameState.unstableRate.hitErrors.push({ offset: deltaTime, time: node.timestamp, result: 100 });
        gameState.hitResultInfo.hit100Count++;
    } else if (Math.abs(deltaTime) < hit50) {
        hitCircleState.hit = true;
        hitCircleState.lockNextObject = false;
        hitCircleState.finished = true;
        hitCircleState.hitResult = HitResult.MEH;

        hitCircle.drawable.animate("HIT", node.timestamp);

        gameState.unstableRate.hitErrors.push({ offset: deltaTime, time: node.timestamp, result: 50 });
        gameState.hitResultInfo.hit50Count++;
    }
}
