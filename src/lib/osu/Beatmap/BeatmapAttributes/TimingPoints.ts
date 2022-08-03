class Timing {
    public beatLength: number;
    public beatLengthBase: number;

    constructor(
        public time: number,
        _beatlength: number,
        base: number,
        public meter: number,
        public sampleSet: number,
        public sampleIndex: number,
        public volume: number,
        public uninhereted: number,
        public effects: number
    ) {
        this.beatLengthBase = base;
        if (uninhereted) {
            this.beatLength = _beatlength;
        } else {
            this.beatLength = (Math.max(10, Math.min(1000, -_beatlength)) * base) / 100;
        }
    }

    get bpm() {
        return (1 / this.beatLengthBase) * 1000 * 60;
    }
}

class TimingPoints {
    timings: Timing[] = [];

    parseStringArray(timingStringArray: string[]) {
        let inheritedBase = 0;
        for (let timingString of timingStringArray) {
            const [time, beatLength, meter, sampleSet, sampleIndex, volume, uninherited, effects] = timingString
                .split(",")
                .map(Number);

            if (uninherited) {
                inheritedBase = beatLength;
            }

            const timing = new Timing(
                time,
                beatLength,
                inheritedBase,
                meter,
                sampleSet,
                sampleIndex,
                volume,
                uninherited,
                effects
            );

            this.timings.push(timing);
        }
    }

    getTimingAt(time: number) {
        let timing = this.timings[0];
        for (let i = 0; i < this.timings.length; i++) {
            if (this.timings[i].time > time) {
                break;
            }
            timing = this.timings[i];
        }
        return timing;
    }

    getInheritedTimingAt(time: number) {
        let timing = this.timings[0];
        for (let i = 0; i < this.timings.length; i++) {
            if (this.timings[i].time > time) {
                break;
            }

            if (!this.timings[i].uninhereted) {
                timing = this.timings[i];
            }
        }
        return timing;
    }

    getUninheritedTimingAt(time: number) {
        let timing = this.timings[0];
        for (let i = 0; i < this.timings.length; i++) {
            if (this.timings[i].time > time) {
                break;
            }

            if (this.timings[i].uninhereted) {
                timing = this.timings[i];
            }
        }
        return timing;
    }
}

export { TimingPoints };
