import { HitCircle } from "./HitObjects/HitCircle";
import { HitObject, HitObjectType, Hitsample } from "./HitObjects/HitObject";
import { Slider } from "./HitObjects/Slider";
import { Spinner } from "./HitObjects/Spinner";

class HitObjects {
    objects: HitObject[] = [];

    parseStringArray(hitObjectStringArray: string[]) {
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

                // Hitsound Parameter
                const [normalSet, additionSet, index, volume, filename] = hitObjectParams[5].split(":");
                const hitSample = new Hitsample(+normalSet, +additionSet, +index, +volume, filename);

                // Add HitObject to array
                const hitObjectConfig = { x, y, time, type, hitSound, hitSample, comboCount };
                const hitCircle = new HitCircle(hitObjectConfig);
                this.objects.push(hitCircle);
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

                // Add HitObject to array
                const hitObjectConfig = { x, y, time, type, hitSound, hitSample, comboCount };
                const sliderConfig = { curveType, curvePoints, slides, length, edgeSounds, edgeSets };
                const slider = new Slider(hitObjectConfig, sliderConfig);
                this.objects.push(slider);
            } else if (hitObjectType & HitObjectType.Spinner) {
                // General Parameter & Slider Parameter
                const [x, y, time, type, hitSound, endTime] = hitObjectParams.slice(0, 6).map(Number);

                // Hitsound Parameter
                const [normalSet, additionSet, index, volume, filename] = hitObjectParams[6].split(":");
                const hitSample = new Hitsample(+normalSet, +additionSet, +index, +volume, filename);

                // Add HitObject to array
                const hitObjectConfig = { x, y, time, type, hitSound, hitSample, comboCount };
                const spinner = new Spinner(hitObjectConfig, endTime);
                this.objects.push(spinner);
            }
        }
    }

    setColour(colour: string[]) {
        let colourIndex = 0;
        for (let hitObject of this.objects) {
            if (hitObject.isNewCombo()) {
                colourIndex = (colourIndex + hitObject.getColourHax()) % colour.length;
            }
            hitObject.colour = colour[colourIndex];
        }
    }
}

export { HitObjects };
