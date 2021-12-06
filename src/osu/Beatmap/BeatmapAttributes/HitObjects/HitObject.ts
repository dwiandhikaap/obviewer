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
}

class HitObject {
    x: number;
    y: number;
    time: number;
    type: HitObjectType;
    hitSound: number;
    hitSample: Hitsample; // Could be undefined
    constructor(hitObjectConfig: HitObjectConfig) {
        const { x, y, time, type, hitSound, hitSample } = hitObjectConfig;
        this.x = x;
        this.y = y;
        this.time = time;
        this.type = type;
        this.hitSound = hitSound;
        this.hitSample = hitSample;
    }
}

export { HitObject, Hitsample, HitObjectConfig, HitObjectType };
