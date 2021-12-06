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
    x: number;
    y: number;
    time: number;
    type: HitObjectType;
    hitSound: number;
    hitSample?: Hitsample;
    comboCount: number;
}

class HitObject {
    x: number;
    y: number;
    time: number;
    type: HitObjectType;
    hitSound: number;
    hitSample: Hitsample;
    comboCount: number;
    colour: string;

    constructor(hitObjectConfig: HitObjectConfig) {
        const { x, y, time, type, hitSound, hitSample, comboCount } = hitObjectConfig;
        this.x = x;
        this.y = y;
        this.time = time;
        this.type = type;
        this.hitSound = hitSound;
        this.hitSample = hitSample;

        this.comboCount = comboCount;
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

    // How many colour(s) are skipped on the new combo
    getColourHax() {
        return (
            ((this.type & (HitObjectType.ColorSkip1 | HitObjectType.ColorSkip2 | HitObjectType.ColorSkip3)) >> 4) + 1
        );
    }
}

export { HitObject, Hitsample, HitObjectConfig, HitObjectType };
