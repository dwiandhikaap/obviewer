import { MathHelper } from "../../../math/MathHelper";
import { HitObject, Slider } from "../../Beatmap/BeatmapAttributes/HitObjects";
import { ReplayNode } from "../../Replay/ReplayNodes";
import { cloneGameState, GameState } from "../types/GameState";
import { HitCircleState, SliderState } from "../types/HitObjectState";

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

export function sliderUpdate(currentState: GameState, node: ReplayNode, slider: Slider) {
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

// slider head + slider end + sldier ticks + slider reverses
function calcSliderAccIncrement(slider: Slider) {
    const sliderTickCount = slider.getStackedSliderTicks().length;
    const sliderReverseCount = slider.getStackedReverseTicks().length;
    const sliderElementCount = 2 + sliderTickCount + sliderReverseCount;
    return 1 / sliderElementCount;
}
