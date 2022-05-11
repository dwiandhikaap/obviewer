import { EasingFunction, EasingType } from "./EasingFunction";

interface Easing {
    startTime: number;
    endTime: number;
    targetFrom: number;
    targetTo: number;
    easingType: EasingType;
}

// Holds possibly different values depending on the given time
class Easer {
    easings: Easing[] = [];
    public time: number = 0;

    constructor(public defaultValue: number | undefined = 0) {}

    static CreateEasing(
        startTime: number,
        endTime: number,
        targetFrom: number,
        targetTo: number,
        easingType: EasingType = "Linear"
    ): Easing {
        return { startTime, endTime, targetFrom, targetTo, easingType };
    }

    get value(): number {
        return this.getValueAt(this.time);
    }

    getValueAt(time: number): number {
        if (this.easings.length === 0) {
            return this.defaultValue ?? NaN;
        }

        let result: number | undefined = undefined;
        let selectedEasing: Easing | undefined = undefined;

        for (let i = this.easings.length - 1; i >= 0; i--) {
            selectedEasing = this.easings[i];

            if (time > selectedEasing.endTime || time < selectedEasing.startTime) {
                continue;
            }

            const t = (time - selectedEasing.startTime) / (selectedEasing.endTime - selectedEasing.startTime);
            result =
                EasingFunction[selectedEasing.easingType](t) * (selectedEasing.targetTo - selectedEasing.targetFrom) +
                selectedEasing.targetFrom;
            break;
        }

        if (result === undefined) {
            if (this.defaultValue !== undefined) {
                result = this.defaultValue;
            } else {
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
                    selectedEasing = this.easings[0];
                    result = selectedEasing.targetFrom;
                } else {
                    selectedEasing = this.easings[closestIndex];
                    result = selectedEasing.targetTo;
                }
            }
        }

        return result;
    }

    // I hate TypeScript function overloading so much 🤮
    addEasing(...easings: Easing[]): Easer;
    addEasing(startTime: number, endTime: number, targetFrom: number, targetTo: number, easingType?: EasingType): Easer;
    addEasing(
        easingsOrStartTime: Easing | number,
        endTime?: number | Easing,
        targetFrom?: number | Easing,
        targetTo?: number | Easing,
        easingType: EasingType | Easing = "Linear"
    ): Easer {
        if (typeof easingsOrStartTime === "number") {
            const startTime = easingsOrStartTime;
            this.easings.push({
                startTime: startTime as number,
                endTime: endTime as number,
                targetFrom: targetFrom as number,
                targetTo: targetTo as number,
                easingType: easingType as EasingType,
            });
        } else {
            this.easings.push(...arguments);
        }

        return this;
    }

    removeEasing(...easings: Easing[]) {
        this.easings = this.easings.filter((e) => !easings.includes(e));
    }

    removeAllEasings() {
        this.easings = [];
    }
}

export { Easer, Easing, EasingFunction, EasingType };
