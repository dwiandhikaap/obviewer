import { DrawableHitCircle } from "./Drawable/DrawableHitCircle";
import { HitObject, HitObjectConfig, HitObjectState } from "./HitObject";

interface HitCircleState extends HitObjectState {
    hit: boolean; // True if circle is hit regardless of early hit (counts as miss) or successful hit (300/100/50), notelock doesn't count
    notelock: boolean;

    lockNextObject: boolean;
}

const DEFAULT_STATE: HitCircleState = {
    hit: false,
    notelock: false,

    hitResult: null,

    lockNextObject: true,
    started: false,
    finished: false,
};

class HitCircle extends HitObject {
    drawable: DrawableHitCircle;
    state = DEFAULT_STATE;

    constructor(hitObjectConfig: HitObjectConfig) {
        super(hitObjectConfig);

        this.drawable = new DrawableHitCircle(this);
    }

    draw(time: number) {
        this.drawable.draw(time);
    }

    update(time: number): void {
        this.drawable.update(time);
    }
}

export { HitCircle, HitCircleState, HitObjectConfig };
