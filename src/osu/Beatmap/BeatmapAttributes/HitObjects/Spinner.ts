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

        const appearTime = this.startTime - this.difficulty.preEmpt;
        const dissapearTime = this.endTime + 150;

        opacity.addSpan(appearTime, this.startTime, 0, 1);
        opacity.addSpan(this.startTime, this.endTime, 1, 1);
        opacity.addSpan(this.endTime, dissapearTime, 1, 0);

        // mocks spinning action (for demo)

        /* const meterSpan = new Spannable();
        const quarterDuration = (this.endTime - this.startTime) / 4;
        meterSpan.addSpan(this.startTime, this.startTime + quarterDuration, 0, 0);
        meterSpan.addSpan(this.startTime + quarterDuration, this.startTime + quarterDuration * 2, 0.33, 0.33);
        meterSpan.addSpan(this.startTime + quarterDuration * 2, this.startTime + quarterDuration * 3, 0.66, 0.66);
        meterSpan.addSpan(this.startTime + quarterDuration * 3, this.startTime + quarterDuration * 4, 1, 1);

        const rpmSpan = new Spannable();
        rpmSpan.addSpan(this.startTime, this.startTime + quarterDuration, 0, 470);
        rpmSpan.addSpan(this.startTime + quarterDuration, this.startTime + quarterDuration * 2, 470, 445);
        rpmSpan.addSpan(this.startTime + quarterDuration * 2, this.endTime, 447, 477);

        const rotationSpan = new Spannable();
        rotationSpan.addSpan(this.startTime + 100, this.startTime + quarterDuration, 0, 360);
        rotationSpan.addSpan(this.startTime + quarterDuration, this.endTime, 360, 360 * 10); */

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
