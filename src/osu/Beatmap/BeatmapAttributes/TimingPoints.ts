class Timing {
    constructor(
        public time: number,
        public _beatlength: number,
        public base: number,
        public meter: number,
        public sampleSet: number,
        public sampleIndex: number,
        public volume: number,
        public uninhereted: number,
        public effects: number
    ) {}

    public get beatLength() {
        if (this.uninhereted) {
            return this._beatlength;
        } else {
            return (Math.max(10, Math.min(1000, -this._beatlength)) * this.base) / 100;
        }
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
}

export { TimingPoints };
