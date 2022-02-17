interface Span {
    startTime: number;
    endTime: number;
    targetFrom: number;
    targetTo: number;
}

// Holds possibly different values depending on the given time
class Spannable {
    private spans: Span[] = [];
    public time: number = 0;

    constructor(public defaultValue?: number) {}

    get value(): number {
        return this.getValueAt(this.time);
    }

    getValueAt(time: number): number {
        if (this.spans.length === 0) {
            return this.defaultValue ?? NaN;
        }

        let result;

        for (let i = this.spans.length - 1; i >= 0; i--) {
            const transform = this.spans[i];

            if (time > transform.endTime || time < transform.startTime) {
                continue;
            }

            result =
                ((time - transform.startTime) / (transform.endTime - transform.startTime)) *
                    (transform.targetTo - transform.targetFrom) +
                transform.targetFrom;

            break;
        }

        if (result === undefined) {
            if (this.defaultValue !== undefined) {
                return this.defaultValue;
            }

            let minDeltaTime = Infinity;
            let closestIndex;
            for (let i = this.spans.length - 1; i >= 0; i--) {
                const transform = this.spans[i];

                if (time < transform.endTime) continue;

                const delta = time - transform.endTime;
                if (delta < minDeltaTime) {
                    minDeltaTime = delta;
                    closestIndex = i;
                }
            }

            if (closestIndex === undefined) {
                return this.spans[0].targetFrom;
            }

            return this.spans[closestIndex].targetTo;
        }

        return result;
    }

    addSpan(startTime: number, endTime: number, targetFrom: number, targetTo: number) {
        this.spans.push({
            startTime,
            endTime,
            targetFrom,
            targetTo,
        });
    }
}

export { Spannable };
