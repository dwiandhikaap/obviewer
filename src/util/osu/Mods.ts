enum Mod {
    None = 0,
    NoFail = 1 << 0,
    Easy = 1 << 1,
    TouchDevice = 1 << 2,
    Hidden = 1 << 3,
    HardRock = 1 << 4,
    SuddenDeath = 1 << 5,
    DoubleTime = 1 << 6,
    Relax = 1 << 7,
    HalfTime = 1 << 8,
    Nightcore = 1 << 9,
    Flashlight = 1 << 10,
    Autoplay = 1 << 11,
    SpunOut = 1 << 12,
    Relax2 = 1 << 13,
    Perfect = 1 << 14,
    TargetPractice = 1 << 23,
    ScoreV2 = 1 << 29,
}

class Mods {
    private _mods = new Array<Mod>();
    private _numeric: number;

    constructor(value: number) {
        this._numeric = value;
        this.constrainCorrection();
        this.construct();
    }

    private constrainCorrection(): void {
        this._numeric & Mod.Nightcore && (this._numeric |= Mod.DoubleTime);
        this._numeric & Mod.Perfect && (this._numeric |= Mod.SuddenDeath);
    }

    private reduceCombinedMods(mods: Array<String>) {
        const result = mods;

        result.includes(Mod[Mod.Nightcore]) &&
            result.splice(result.indexOf(Mod[Mod.DoubleTime]), 1);

        result.includes(Mod[Mod.Perfect]) &&
            result.splice(result.indexOf(Mod[Mod.SuddenDeath]), 1);

        return result;
    }

    private construct() {
        const value = this._numeric;
        if (value <= 0) {
            this._mods = [Mod.None];
            return;
        }

        let result = new Array<Mod>();
        (value >>> 0)
            .toString(2)
            .split("")
            .map(Number)
            .reverse()
            .reduce(
                (prev, currVal, currIndex) =>
                    currVal && result.push(currVal << currIndex)
            );

        this._mods = result.reverse();
    }

    public get mods() {
        let fullModsString = this._mods.map((mod) => Mod[mod]);

        return this.reduceCombinedMods(fullModsString);
    }

    public get numeric() {
        return this._numeric;
    }

    public contains(mods: Array<Mod>): boolean;
    public contains(mod: Mod): boolean;
    public contains(mods: any): boolean {
        if (typeof mods === "number") {
            return (mods & this._numeric) === mods;
        }

        if (mods instanceof Array) {
            let result = true;
            for (const mod of mods) {
                if ((mod & this._numeric) !== mod) {
                    result = false;
                    break;
                }
            }
            return result;
        }
    }

    public set(mod: Mod, enable: boolean) {
        if (enable) {
            this.enable(mod);
        } else {
            this.disable(mod);
        }

        this.constrainCorrection();
        this.construct();
    }

    public enable(mod: Mod) {
        this._numeric |= mod;
    }

    public disable(mod: Mod) {
        this._numeric ^= this.numeric & mod;
    }
}

export { Mods, Mod };
