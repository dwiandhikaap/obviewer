import { Spannable } from "../../../../math/Spannable";
import { HitObject, HitObjectConfig } from "./HitObject";

interface SpinnerState {
    rpm: number;
    rotation: number;

    meter: number;
    hit: boolean;

    opacity: Spannable;
}

class Spinner extends HitObject {
    state: SpinnerState;

    constructor(hitObjectConfig: HitObjectConfig) {
        super(hitObjectConfig);

        this.state = this.initializeState();
    }

    private initializeState(): SpinnerState {
        const opacity = new Spannable();

        const appearTime = this.startTime - this.difficulty.getPreempt();
        const dissapearTime = this.endTime + 150;

        opacity.addSpan(appearTime, this.startTime, 0, 1);
        opacity.addSpan(this.startTime, this.endTime, 1, 1);
        opacity.addSpan(this.endTime, dissapearTime, 1, 0);

        return {
            rpm: 0,
            rotation: 0,
            meter: 0,
            hit: false,

            opacity,
        };
    }

    // where do i calculate the rotation and rpm bs?
    updateState(time: number, hit?: boolean) {
        this.state.opacity.time = time;

        if (hit !== undefined) {
            this.state.hit = hit;
        }
    }
}

export { Spinner };
