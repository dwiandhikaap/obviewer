import { MathHelper } from "../../../math/MathHelper";
import { Beatmap } from "../../Beatmap/Beatmap";
import { HitObject, Slider } from "../../Beatmap/BeatmapAttributes/HitObjects";
import { ReplayNode } from "../../Replay/ReplayNodes";
import { cloneGameState, GameState } from "../GameState";
import { IObjectUpdateData } from "../GameState/generator";
import { HitCircleState } from "../../Beatmap/BeatmapAttributes/HitObjects/HitCircle";
import { SliderState } from "../../Beatmap/BeatmapAttributes/HitObjects/Slider";
import { Ruleset } from "./Ruleset";
import { getObjectToHit } from "./util";

const HITTABLE_RANGE = 400;

export function sliderHeadCheck(currentState: GameState, node: ReplayNode, targetSlider: Slider, visibleObjects: HitObject[]) {
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

            const isHitting = MathHelper.InsideCircle(object.getStackedStartPos(), nodePos, diff.getObjectRadius());

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

export function sliderUpdate2(currentState: GameState, node: ReplayNode, slider: Slider) {
    const sliderState = currentState.hitObjectStates[slider.objectIndex] as SliderState;

    if (node.isPressing()) {
        const nodeTime = node.timestamp;
        const slidePos = slider.getStackedPositionAt(node.timestamp);
        let slideRadius = slider.difficulty.getObjectRadius();

        const isSliding = MathHelper.InsideCircle(slidePos, [node.x, node.y], slideRadius);

        if (isSliding) {
            slideRadius = slider.difficulty.getObjectRadius() * 2.4;
        }
    }
}

export const sliderUpdate: Ruleset<Slider> = (
    slider: Slider,
    beatmap: Beatmap,
    node: ReplayNode,
    gameState: GameState,
    objectUpdateData: IObjectUpdateData
) => {
    const diff = beatmap.difficulty;
    const [hit300, hit100, hit50] = diff.getHitWindows();

    const objectState = gameState.hitObjectStates[slider.objectIndex] as SliderState;

    //console.log(objectState.isFollowed ? "followed" : "not followed");

    // Slider Head check
    if (!objectState.sliderHeadFinished) {
        if (node.timestamp - slider.startTime > hit50) {
            objectState.lockNextObject = false;
            objectState.sliderBreak = true;
        }

        if (node.isPressing() && !objectUpdateData.alreadyHit) {
            if (MathHelper.InsideCircle(slider.startPos, [node.x, node.y], diff.getObjectRadius())) {
                applyHitting(slider, beatmap, node, gameState);
                objectUpdateData.alreadyHit = true;
            }
        }
    }

    if (node.isHolding()) {
        const ballPos = slider.getStackedPositionAt(node.timestamp);
        if (!objectState.isFollowed && MathHelper.InsideCircle(ballPos, [node.x, node.y], diff.getObjectRadius())) {
            objectState.isFollowed = true;
            slider.drawable.animate("FOLLOW_START", node.timestamp);
        }

        if (objectState.isFollowed && !MathHelper.InsideCircle(ballPos, [node.x, node.y], diff.getObjectRadius() * 2.4)) {
            objectState.isFollowed = false;
            slider.drawable.animate("UNFOLLOW", node.timestamp);
        }

        if (objectState.isFollowed && node.timestamp >= slider.endTime) {
            objectState.isFollowed = false;
            // slider.drawable.animate("FOLLOW_END", node.timestamp);

            console.log("end");
        }
    }

    return gameState;
};

function applyHitting(slider: Slider, beatmap: Beatmap, node: ReplayNode, gameState: GameState) {
    const deltaTime = node.timestamp - slider.startTime;
    const [hit300, hit100, hit50] = slider.difficulty.getHitWindows();
    const sliderState = gameState.hitObjectStates[slider.objectIndex] as SliderState;

    // Prev HitObject Notelock check
    if (slider !== getObjectToHit(beatmap, gameState) || deltaTime < -HITTABLE_RANGE) {
        return;
    }

    // Early hit causes miss
    if (deltaTime < -hit50) {
        sliderState.sliderHeadFinished = true;
        sliderState.lockNextObject = false;
        sliderState.sliderBreak = true;

        gameState.combo = 0;
    }

    if (Math.abs(deltaTime) < hit50) {
        sliderState.sliderHeadFinished = true;
        sliderState.lockNextObject = false;
        sliderState.accuracy += calcSliderAccIncrement(slider);

        const result = deltaTime < 300 ? 300 : deltaTime < 100 ? 100 : 50;

        gameState.combo++;
        gameState.unstableRate.hitErrors.push({ offset: deltaTime, time: node.timestamp, result: result });
    }
}

// slider head + slider end + sldier ticks + slider reverses
function calcSliderAccIncrement(slider: Slider) {
    const sliderTickCount = slider.getStackedSliderTicks().length;
    const sliderReverseCount = slider.getStackedReverseTicks().length;
    const sliderElementCount = 2 + sliderTickCount + sliderReverseCount;
    return 1 / sliderElementCount;
}
