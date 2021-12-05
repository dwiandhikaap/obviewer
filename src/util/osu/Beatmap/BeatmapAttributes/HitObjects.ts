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

class HitObject {
    constructor(
        public x: number,
        public y: number,
        public time: number,
        public type: HitObjectType,
        public hitSound: number,
        public hitSample: Hitsample
    ) {}
}
class HitCircle extends HitObject {
    constructor(
        public x: number,
        public y: number,
        public time: number,
        public type: HitObjectType,
        public hitSound: number,
        public hitSample: Hitsample
    ) {
        super(x, y, time, type, hitSound, hitSample);
    }
}

class Slider extends HitObject {
    constructor(
        public x: number,
        public y: number,
        public time: number,
        public type: HitObjectType,
        public hitSound: number,
        public curveType: string,
        public curvePoints: number[][],
        public slides: number,
        public length: number,
        public edgeSounds: number[],
        public edgeSets: string[][],
        public hitSample: Hitsample
    ) {
        super(x, y, time, type, hitSound, hitSample);
    }
}

class Spinner extends HitObject {
    constructor(
        public x: number,
        public y: number,
        public time: number,
        public type: HitObjectType,
        public hitSound: number,
        public endTime: number,
        public hitSample: Hitsample
    ) {
        super(x, y, time, type, hitSound, hitSample);
    }
}

class HitObjects {
    objects: HitObject[] = [];

    parseStringArray(hitObjectStringArray: string[]) {
        for (let hitObjectString of hitObjectStringArray) {
            const hitObjectParams = hitObjectString.split(",");
            const hitObjectType = parseInt(hitObjectParams[3]);

            if (hitObjectType & HitObjectType.HitCircle) {
                // General Parameter
                const [x, y, time, type, hitSound] = hitObjectParams.slice(0, 5).map(Number);

                // Hitsound Parameter
                const [normalSet, additionSet, index, volume, filename] = hitObjectParams[5].split(":");
                const hitSample = new Hitsample(+normalSet, +additionSet, +index, +volume, filename);

                this.objects.push(new HitCircle(x, y, time, type, hitSound, hitSample));
            } else if (hitObjectType & HitObjectType.Slider) {
                // General Parameter
                const [x, y, time, type, hitSound] = hitObjectParams.slice(0, 5).map(Number);

                // Slider Parameter
                const [curveType, ...curvePointsStr] = hitObjectParams[5].split("|");
                const curvePoints = curvePointsStr.map((curvePoint) => curvePoint.split(":").map(Number));

                const [slides, length] = hitObjectParams.slice(6, 8).map(Number);

                // If the Hitsound Parameter exists
                if (hitObjectParams.length > 8) {
                    var edgeSounds = hitObjectParams[8].split("|").map(Number);
                    var edgeSets = hitObjectParams[9].split("|").map((edgeSet) => edgeSet.split(":"));

                    const [normalSet, additionSet, index, volume, filename] = hitObjectParams[10].split(":");
                    var hitSample = new Hitsample(+normalSet, +additionSet, +index, +volume, filename);
                }

                this.objects.push(
                    new Slider(
                        x,
                        y,
                        time,
                        type,
                        hitSound,
                        curveType,
                        curvePoints,
                        slides,
                        length,
                        edgeSounds,
                        edgeSets,
                        hitSample
                    )
                );
            } else if (hitObjectType & HitObjectType.Spinner) {
                // General Parameter & Slider Parameter
                const [x, y, time, type, hitSound, endTime] = hitObjectParams.slice(0, 6).map(Number);

                // Hitsound Parameter
                const [normalSet, additionSet, index, volume, filename] = hitObjectParams[6].split(":");
                const hitSample = new Hitsample(+normalSet, +additionSet, +index, +volume, filename);

                this.objects.push(new Spinner(x, y, time, type, hitSound, endTime, hitSample));
            }
        }
    }

    getHitObjectByTime(time: number): HitObject {
        return this.objects.find((object) => object.time === time);
    }
}

export { HitObjects };
