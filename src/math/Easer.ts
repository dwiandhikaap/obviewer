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

    constructor(public fallbackValue: number = 0) {}

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
            return this.fallbackValue;
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
            let minDeltaTime = Infinity;
            let closestIndexBefore: number = 0;

            // edge case, time is before the first easing
            if (time < this.easings[0].startTime) {
                result = this.easings[0].targetFrom;
            } else {
                for (let i = 0; i < this.easings.length; i++) {
                    const easing = this.easings[i];
                    const deltaTime = time - easing.endTime;

                    if (deltaTime < 0) {
                        break;
                    }

                    if (minDeltaTime > deltaTime) {
                        minDeltaTime = deltaTime;
                        closestIndexBefore = i;
                    }
                }

                const closestEasing = this.easings[closestIndexBefore];
                result = closestEasing.targetTo;
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
