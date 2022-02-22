import { Path } from "../../../math/Path";
import { Vector2 } from "../../../math/Vector2";
import { Difficulty } from "./Difficulty";
import { HitCircle } from "./HitObjects/HitCircle";
import { HitObject, HitObjectType, Hitsample } from "./HitObjects/HitObject";
import { Slider, SliderReverseTick, SliderTick } from "./HitObjects/Slider";
import { Spinner } from "./HitObjects/Spinner";
import { TimingPoints } from "./TimingPoints";

class HitObjects {
    objects: HitObject[] = [];

    parseStringArray(hitObjectStringArray: string[], difficulty: Difficulty, timing: TimingPoints) {
        let comboCount = 0;
        for (let hitObjectString of hitObjectStringArray) {
            const hitObjectParams = hitObjectString.split(",");
            const hitObjectType = parseInt(hitObjectParams[3]);

            // If new combo or spinner, reset the combo
            (hitObjectType & HitObjectType.NewCombo || hitObjectType & HitObjectType.Spinner) && (comboCount = 0);
            comboCount++;
            if (hitObjectType & HitObjectType.HitCircle) {
                // General Parameter
                const [x, y, time, type, hitSound] = hitObjectParams.slice(0, 5).map(Number);
                const startPos: [number, number] = [x, y];
                const endPos: [number, number] = [x, y];
                const startTime = time;
                const endTime = time;

                // Hitsound Parameter
                const [normalSet, additionSet, index, volume, filename] = hitObjectParams[5].split(":");
                const hitSample = new Hitsample(+normalSet, +additionSet, +index, +volume, filename);

                // Add HitObject to array
                const hitObjectConfig = {
                    startPos,
                    endPos,
                    startTime,
                    endTime,
                    type,
                    hitSound,
                    hitSample,
                    comboCount,
                    difficulty,
                };
                const hitCircle = new HitCircle(hitObjectConfig);
                this.objects.push(hitCircle);
            } else if (hitObjectType & HitObjectType.Slider) {
                // General Parameter
                const [x, y, time, type, hitSound] = hitObjectParams.slice(0, 5).map(Number);
                const startTime = time;
                const endTime = time; // will be overwritten later on applyTiming() method

                // Slider Parameter
                const [curveType, ...curvePointsStr] = hitObjectParams[5].split("|");
                const [slides, length] = hitObjectParams.slice(6, 8).map(Number);

                const curvePoints = curvePointsStr.map((curvePoint) => curvePoint.split(":").map(Number));
                const curvePath = new Path(curveType, [[x, y]].concat(curvePoints), length);

                // Slider Position
                const startPos: [number, number] = [x, y];
                const endPosRaw = curvePath.points[curvePath.points.length - 1].toTuple();
                const endPos: [number, number] = [Math.floor(endPosRaw[0]), Math.floor(endPosRaw[1])];

                let hitSample = new Hitsample(0, 0, 0, 0, "");
                let edgeSounds: number[] = [];
                let edgeSets: string[][] = [];

                // If the Hitsound Parameter exists
                if (hitObjectParams.length > 8) {
                    edgeSounds = hitObjectParams[8].split("|").map(Number);
                    edgeSets = hitObjectParams[9].split("|").map((edgeSet) => edgeSet.split(":"));

                    const [normalSet, additionSet, index, volume, filename] = hitObjectParams[10].split(":");
                    hitSample = new Hitsample(+normalSet, +additionSet, +index, +volume, filename);
                }

                // Add HitObject to array
                const hitObjectConfig = {
                    startPos,
                    endPos,
                    startTime,
                    endTime,
                    type,
                    hitSound,
                    hitSample,
                    comboCount,
                    difficulty,
                };
                const sliderConfig = { curveType, curvePoints, curvePath, slides, length, edgeSounds, edgeSets };
                const slider = new Slider(hitObjectConfig, sliderConfig, timing);
                this.objects.push(slider);
            } else if (hitObjectType & HitObjectType.Spinner) {
                // General Parameter & Slider Parameter
                const [x, y, time, type, hitSound, endTime] = hitObjectParams.slice(0, 6).map(Number);
                const startPos: [number, number] = [x, y];
                const endPos = startPos;
                const startTime = time;

                // Hitsound Parameter
                const [normalSet, additionSet, index, volume, filename] = hitObjectParams[6].split(":");
                const hitSample = new Hitsample(+normalSet, +additionSet, +index, +volume, filename);

                // Add HitObject to array
                const hitObjectConfig = {
                    startPos,
                    endPos,
                    startTime,
                    endTime,
                    type,
                    hitSound,
                    hitSample,
                    comboCount,
                    difficulty,
                };
                const spinner = new Spinner(hitObjectConfig);
                this.objects.push(spinner);
            }
        }
    }

    applyColour(colour: string[]) {
        let colourIndex = 0;
        for (let hitObject of this.objects) {
            if (hitObject.isNewCombo()) {
                colourIndex = (colourIndex + hitObject.getColourHax()) % colour.length;
            }
            hitObject.colour = colour[colourIndex];
        }
    }

    // source : https://gist.githubusercontent.com/peppy/1167470/raw/a665e0774b040f7a930c436baa534b002b1c23ef/osuStacking.cs
    applyStacking(difficulty: Difficulty, stackLeniency: number) {
        const hitObjectRadius = difficulty.getObjectRadius();

        const stackOffset = hitObjectRadius / 10;

        const STACK_LENIENCE = 3;
        const stackThreshold = difficulty.preEmpt * stackLeniency;

        // Reverse pass for stack calculation
        for (let i = this.objects.length - 1; i > 0; i--) {
            let n = i;

            let objectI = this.objects[i];

            if (objectI.stackCount != 0 || objectI.isSpinner()) continue;

            if (objectI.isHitCircle()) {
                while (--n >= 0) {
                    const objectN = this.objects[n];

                    if (objectN.isSpinner()) continue;
                    if (objectI.startTime - objectN.endTime > stackThreshold) break;

                    if (objectN.isSlider() && Vector2.Distance(objectN.endPos, objectI.startPos) < STACK_LENIENCE) {
                        let offset = objectI.stackCount - objectN.stackCount + 1;

                        for (let j = n + 1; j <= i; j++) {
                            if (Vector2.Distance(objectN.endPos, this.objects[j].startPos) < STACK_LENIENCE) {
                                this.objects[j].stackCount -= offset;
                            }
                        }
                        break;
                    }

                    if (Vector2.Distance(objectN.startPos, objectI.startPos) < STACK_LENIENCE) {
                        objectN.stackCount = objectI.stackCount + 1;
                        objectI = objectN;
                    }
                }
            } else if (objectI.isSlider()) {
                while (--n >= 0) {
                    let objectN = this.objects[n];

                    if (objectN.isSpinner()) continue;
                    if (objectI.startTime - objectN.startTime > stackThreshold) break;

                    if (Vector2.Distance(objectN.endPos, objectI.startPos) < STACK_LENIENCE) {
                        objectN.stackCount = objectI.stackCount + 1;
                        objectI = objectN;
                    }
                }
            }
        }

        for (const object of this.objects) {
            if (object.isSpinner()) continue;

            const stackCount = object.stackCount;
            const stackDistance = stackCount * stackOffset;

            object.stackOffset = stackDistance;
        }
    }

    getIndexNear(timestamp: number) {
        let mid;
        let lo = 0;
        let hi = this.objects.length - 1;
        while (hi - lo > 1) {
            mid = Math.floor((lo + hi) / 2);
            if (this.objects[mid].startTime < timestamp) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        if (timestamp - this.objects[lo].startTime <= this.objects[hi].startTime - timestamp) {
            return lo;
        }
        return hi;
    }

    getNear(timestamp: number) {
        const index = this.getIndexNear(timestamp);
        return this.objects[index];
    }

    grab(startTime: number, endTime: number) {
        const lastObjectTimestamp = this.objects[this.objects.length - 1].startTime;

        const startIndex = this.getIndexNear(Math.max(0, startTime));
        const endIndex = this.getIndexNear(Math.min(endTime, lastObjectTimestamp));

        return this.objects.slice(startIndex, endIndex + 1);
    }
}

export { HitObjects, HitObject, HitCircle, Slider, Spinner };
