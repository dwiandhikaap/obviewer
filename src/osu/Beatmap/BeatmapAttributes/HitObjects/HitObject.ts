import { Difficulty } from "../Difficulty";

enum HitObjectType {
    HitCircle = 1 << 0,
    Slider = 1 << 1,
    Spinner = 1 << 3,
    NewCombo = 1 << 2,
    ColorSkip1 = 1 << 4,
    ColorSkip2 = 1 << 5,
    ColorSkip3 = 1 << 6,
}

class Hitsample {
    constructor(
        public normalSet: number,
        public additionSet: number,
        public index: number,
        public volume: number,
        public filename: string
    ) {}
}

interface HitObjectConfig {
    startPos: [number, number];
    endPos: [number, number];
    startTime: number;
    endTime: number;
    type: HitObjectType;
    hitSound: number;
    hitSample?: Hitsample;
    comboCount: number;
    difficulty: Difficulty;
}

class HitObject {
    startPos: [number, number];
    endPos: [number, number];
    startTime: number;
    endTime: number;
    type: HitObjectType;
    hitSound: number;
    hitSample?: Hitsample;
    comboCount: number;

    colour: string = "#ffffff";
    difficulty: Difficulty;

    stackCount: number = 0;
    stackOffset: number = 0;

    constructor(hitObjectConfig: HitObjectConfig) {
        const { startPos, endPos, startTime, endTime, type, hitSound, hitSample, comboCount, difficulty } =
            hitObjectConfig;
        this.startPos = startPos;
        this.endPos = endPos;
        this.startTime = startTime;
        this.endTime = endTime;
        this.type = type;
        this.hitSound = hitSound;
        this.hitSample = hitSample;
        this.difficulty = difficulty;

        this.comboCount = comboCount;
    }

    getStackedStartPos() {
        return [this.startPos[0] - this.stackOffset, this.startPos[1] - this.stackOffset];
    }

    getStackedEndPos() {
        return [this.endPos[0] - this.stackOffset, this.endPos[1] - this.stackOffset];
    }

    setNewCombo() {
        this.type &= HitObjectType.NewCombo;
    }

    isNewCombo() {
        return this.type & HitObjectType.NewCombo;
    }

    isHitCircle() {
        return this.type & HitObjectType.HitCircle;
    }

    isSlider() {
        return this.type & HitObjectType.Slider;
    }

    isSpinner() {
        return this.type & HitObjectType.Spinner;
    }

    isVisibleAt(time: number) {
        return time >= this.startTime - this.difficulty.preEmpt && time <= this.endTime + 150;
    }

    // How many colour(s) are skipped on the new combo
    getColourHax() {
        return (
            ((this.type & (HitObjectType.ColorSkip1 | HitObjectType.ColorSkip2 | HitObjectType.ColorSkip3)) >> 4) + 1
        );
    }
}

export { HitObject, Hitsample, HitObjectConfig, HitObjectType };
