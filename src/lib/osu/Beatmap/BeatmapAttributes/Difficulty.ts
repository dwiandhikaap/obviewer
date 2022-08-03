import { Mod, Mods } from "../../Mods/Mods";

const PREEMPT_MIN = 450;
const TIME_PREEMPT = 600;
const TIME_FADEIN = 400;

class Difficulty {
    public mods: Mods;

    private hp = 5;
    private cs = 5;
    private od = 5;
    private ar = 5;

    sliderMultiplier = 1.4;
    sliderTickRate = 1;

    parseStringArray(args: string[], mods?: Mods) {
        // "key : value" String Format Parsing
        const [hp, cs, od, ar, sliderMultiplier, sliderTickRate] = args.map((row) => row.replace(/.+: */g, ""));

        this.hp = parseFloat(hp);
        this.cs = parseFloat(cs);
        this.od = parseFloat(od);
        this.ar = parseFloat(ar);

        this.sliderMultiplier = parseFloat(sliderMultiplier);
        this.sliderTickRate = parseFloat(sliderTickRate);

        this.mods = mods ?? new Mods();
        //console.log(this.mods);
    }

    // Source : https://github.com/ppy/osu/blob/3f31cb39c003990d01bad26cc610553a6e936851/osu.Game.Rulesets.Osu/Objects/OsuHitObject.cs
    get fadeIn() {
        return TIME_FADEIN * Math.min(1, TIME_PREEMPT / PREEMPT_MIN);
    }

    getPreempt(mods = this.mods) {
        let ar = this.getAR(mods);
        return difficultyRange(ar, 1800, 1200, PREEMPT_MIN);
    }

    getAR(mods = this.mods) {
        if (mods.contains(Mod.Easy)) {
            return this.ar / 2;
        }
        if (mods.contains(Mod.HardRock)) {
            return Math.min(this.ar * 1.4, 10);
        } else {
            return this.ar;
        }
    }

    getOD(mods = this.mods) {
        if (mods.contains(Mod.Easy)) {
            return this.od / 2;
        }
        if (mods.contains(Mod.HardRock)) {
            return Math.min(this.od * 1.4, 10);
        } else {
            return this.od;
        }
    }

    getCS(mods = this.mods) {
        if (mods.contains(Mod.Easy)) {
            return this.cs / 2;
        }
        if (mods.contains(Mod.HardRock)) {
            return Math.min(this.cs * 1.3, 10);
        } else {
            return this.cs;
        }
    }

    getHP(mods = this.mods) {
        if (mods.contains(Mod.Easy)) {
            return this.hp / 2;
        }
        if (mods.contains(Mod.HardRock)) {
            return Math.min(this.hp * 1.4, 10);
        } else {
            return this.hp;
        }
    }

    getObjectRadius(mods = this.mods) {
        const cs = this.getCS(mods);
        const r = difficultyRange(cs, 54.4, 32, 9.6);

        return r;
    }

    getHitWindows(mods = this.mods): [number, number, number] {
        const hit300 = 79 - this.getOD(mods) * 6 + 0.5;
        const hit100 = 139 - this.getOD(mods) * 8 + 0.5;
        const hit50 = 199 - this.getOD(mods) * 10 + 0.5;
        return [hit300, hit100, hit50];
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
