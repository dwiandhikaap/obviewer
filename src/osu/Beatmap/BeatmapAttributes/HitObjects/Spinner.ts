import { Spannable } from "../../../../math/Spannable";
import { HitObject, HitObjectConfig } from "./HitObject";

interface SpinnerDrawProperty {
    rpm: number;
    rotation: number;

    meter: number;

    opacity: Spannable;
}

class Spinner extends HitObject {
    drawProperty: SpinnerDrawProperty;

    constructor(hitObjectConfig: HitObjectConfig) {
        super(hitObjectConfig);

        this.drawProperty = this.initializeState();
    }

    private initializeState(): SpinnerDrawProperty {
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

            opacity,
        };
    }

    updateDrawProperty(time: number): void {
        this.drawProperty.opacity.time = time;
    }
}

export { Spinner };
