import { Mod, Mods } from "../../Mods/Mods";

const PREEMPT_MIN = 450;
const TIME_PREEMPT = 600;
const TIME_FADEIN = 400;
class Difficulty {
    // Real value before mods are applied
    private _hpDrainRate = 5;
    private _circleSize = 5;
    private _overallDifficulty = 5;
    private _approachRate = 5;

    mods = new Mods();

    hpDrainRate = 5;
    circleSize = 5;
    overallDifficulty = 5;
    approachRate = 5;
    sliderMultiplier = 1.4;
    sliderTickRate = 1;

    parseStringArray(args: string[]) {
        // "key : value" String Format Parsing
        const [hpDrainRate, circleSize, overallDifficulty, approachRate, sliderMultiplier, sliderTickRate] = args.map(
            (row) => row.replace(/.+: */g, "")
        );

        this._hpDrainRate = parseFloat(hpDrainRate);
        this._circleSize = parseFloat(circleSize);
        this._overallDifficulty = parseFloat(overallDifficulty);
        this._approachRate = parseFloat(approachRate);

        this.hpDrainRate = this._hpDrainRate;
        this.circleSize = this._circleSize;
        this.overallDifficulty = this._overallDifficulty;
        this.approachRate = this._approachRate;
        this.sliderMultiplier = parseFloat(sliderMultiplier);
        this.sliderTickRate = parseFloat(sliderTickRate);

        this.applyMods(this.mods);
    }

    // TODO: create individual property instead for each mod (EZ and HR)
    // example : circleSizeEZ, approachRateHR, etc...

    applyMods(mods: Mods) {
        this.mods = mods;
        if (mods.contains(Mod.HardRock)) {
            this.approachRate = Math.min(this._approachRate * 1.4, 10);
            this.circleSize = Math.min(this._circleSize * 1.3, 10);
            this.overallDifficulty = Math.min(this._overallDifficulty * 1.4, 10);
            this.hpDrainRate = Math.min(this._hpDrainRate * 1.4, 10);
        }

        if (mods.contains(Mod.Easy)) {
            this.approachRate = this._approachRate / 2;
            this.circleSize = this._circleSize / 2;
            this.overallDifficulty = this._overallDifficulty / 2;
            this.hpDrainRate = this._hpDrainRate / 2;
        }

        return this;
    }

    /* 
        Source : https://github.com/ppy/osu/blob/3f31cb39c003990d01bad26cc610553a6e936851/osu.Game.Rulesets.Osu/Objects/OsuHitObject.cs
    */
    get preEmpt() {
        return difficultyRange(this.approachRate, 1800, 1200, PREEMPT_MIN);
    }

    get fadeIn() {
        return TIME_FADEIN * Math.min(1, TIME_PREEMPT / PREEMPT_MIN);
        // return difficultyRange(this.approachRate, 1200, 800, 300); i forgot where is this from
    }

    getObjectRadius() {
        const r = difficultyRange(this.circleSize, 54.4, 32, 9.6);

        return r;
    }
}

/* 
    Source: https://github.com/ppy/osu/blob/3f31cb39c003990d01bad26cc610553a6e936851/osu.Game/Beatmaps/IBeatmapDifficultyInfo.cs#L56
*/
function difficultyRange(difficulty: number, min: number, mid: number, max: number) {
    if (difficulty > 5) return mid + ((max - mid) * (difficulty - 5)) / 5;
    if (difficulty < 5) return mid - ((mid - min) * (5 - difficulty)) / 5;

    return mid;
}

export { Difficulty };
