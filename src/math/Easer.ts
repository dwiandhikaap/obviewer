import { EasingFunction, EasingType } from "./Easing";

interface IEasing {
    startTime: number;
    endTime: number;
    targetFrom: number;
    targetTo: number;
    easing: EasingType;
}

// Holds possibly different values depending on the given time
class Easer {
    private easings: IEasing[] = [];
    public time: number = 0;

    constructor(public defaultValue?: number) {}

    get value(): number {
        return this.getValueAt(this.time);
    }

    getValueAt(time: number): number {
        if (this.easings.length === 0) {
            return this.defaultValue ?? NaN;
        }

        let result;

        for (let i = this.easings.length - 1; i >= 0; i--) {
            const transform = this.easings[i];

            if (time > transform.endTime || time < transform.startTime) {
                continue;
            }

            const t = (time - transform.startTime) / (transform.endTime - transform.startTime);
            result = EasingFunction[transform.easing](t) * (transform.targetTo - transform.targetFrom) + transform.targetFrom;
            break;
        }

        if (result === undefined) {
            if (this.defaultValue !== undefined) {
                return this.defaultValue;
            }

            let minDeltaTime = Infinity;
            let closestIndex;
            for (let i = this.easings.length - 1; i >= 0; i--) {
                const transform = this.easings[i];

                if (time < transform.endTime) continue;

                const delta = time - transform.endTime;
                if (delta < minDeltaTime) {
                    minDeltaTime = delta;
                    closestIndex = i;
                }
            }

            if (closestIndex === undefined) {
                return this.easings[0].targetFrom;
            }

            return this.easings[closestIndex].targetTo;
        }

        return result;
    }

    addEasing(startTime: number, endTime: number, targetFrom: number, targetTo: number, easing: EasingType = "Linear") {
        this.easings.push({
            startTime,
            endTime,
            targetFrom,
            targetTo,
            easing,
        });

        return this;
    }
}

export { Easer };
