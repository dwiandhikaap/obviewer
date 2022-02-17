import { Spannable } from "../../../../math/Spannable";
import { HitObject, HitObjectConfig } from "./HitObject";

interface HitCircleState {
    hit: boolean;

    opacity: Spannable;

    approachCircleOpacity: Spannable;
    approachCircleScale: Spannable;
}

class HitCircle extends HitObject {
    state: HitCircleState;

    constructor(hitObjectConfig: HitObjectConfig) {
        super(hitObjectConfig);

        this.state = this.initializeState();
    }

    private initializeState(): HitCircleState {
        const { preEmpt, fadeIn } = this.difficulty;

        const opacity: Spannable = new Spannable();
        const appearTime = this.startTime - preEmpt;

        opacity.addSpan(appearTime, appearTime + fadeIn, 0, 1);
        opacity.addSpan(appearTime + fadeIn, this.endTime, 1, 1);
        opacity.addSpan(this.startTime, this.startTime + 150, 1, 0);

        const approachCircleOpacity: Spannable = new Spannable(0);
        approachCircleOpacity.addSpan(appearTime, appearTime + Math.min(fadeIn * 2, preEmpt), 0, 1);
        approachCircleOpacity.addSpan(appearTime + Math.min(fadeIn * 2, preEmpt), this.startTime, 1, 1);

        const approachCircleScale: Spannable = new Spannable(1);
        approachCircleScale.addSpan(appearTime, this.startTime, 4, 1);

        return {
            hit: false,
            opacity: opacity,
            approachCircleOpacity: approachCircleOpacity,
            approachCircleScale: approachCircleScale,
        };
    }

    updateState(time: number, hit?: boolean) {
        this.state.opacity.time = time;
        this.state.approachCircleOpacity.time = time;
        this.state.approachCircleScale.time = time;

        if (hit !== undefined) {
            this.state.hit = hit;
        }
    }
}

export { HitCircle, HitObjectConfig };
