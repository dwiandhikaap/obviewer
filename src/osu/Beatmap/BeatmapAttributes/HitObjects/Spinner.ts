import { DrawableSpinner } from "./Drawable/DrawableSpinner";
import { HitObject, HitObjectConfig, HitObjectState } from "./HitObject";
interface SpinnerState extends HitObjectState {
    inertia: number;
    rpm: number;
}

const DEFAULT_STATE: SpinnerState = {
    inertia: 0,
    rpm: 0,

    hitResult: null,

    started: false,
    finished: false,
};

class Spinner extends HitObject {
    drawable: DrawableSpinner;
    state = DEFAULT_STATE;

    constructor(hitObjectConfig: HitObjectConfig) {
        super(hitObjectConfig);

        this.drawable = new DrawableSpinner(this);
    }

    draw(time: number): void {
        this.drawable.draw(time);
    }
}

export { Spinner, SpinnerState };
