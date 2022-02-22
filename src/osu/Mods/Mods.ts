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
    @constrainCorrection()
    private _numeric: number;
    private _list = new Array<Mod>();

    constructor(value: number = 0) {
        this.numeric = value;
    }

    public get list() {
        let fullModsString = this._list.map((mod) => Mod[mod]);

        return reduceCombinedMods(fullModsString);
    }

    public get numeric() {
        return this._numeric;
    }

    public set numeric(value: number) {
        if (value <= 0) {
            this._list = [Mod.None];
            return;
        }

        let result = new Array<Mod>();
        (value >>> 0)
            .toString(2)
            .split("")
            .map(Number)
            .reverse()
            .reduce((prev, currVal, currIndex) => currVal && result.push(currVal << currIndex));

        this._numeric = value;
        this._list = result.reverse();
    }

    public contains(list: Array<Mod>): boolean;
    public contains(mod: Mod): boolean;
    public contains(arg: Mod | Array<Mod>): boolean {
        if (arg instanceof Array) {
            let result = true;
            for (const mod of arg) {
                if ((mod & this._numeric) !== mod) {
                    result = false;
                    break;
                }
            }
            return result;
        }

        return (arg & this._numeric) === arg;
    }

    public set(mod: Mod, enable: boolean) {
        if (enable) {
            return this.enable(mod);
        } else {
            return this.disable(mod);
        }
    }

    public enable(mod: Mod) {
        this.numeric |= mod;
        return this;
    }

    public disable(mod: Mod) {
        this.numeric ^= this.numeric & mod;
        return this;
    }
}

/* Reduce from "[..., Nightcore, DoubleTime]" to [..., Nightcore] */
function reduceCombinedMods(list: Array<String>) {
    const result = list;

    result.includes(Mod[Mod.Nightcore]) && result.splice(result.indexOf(Mod[Mod.DoubleTime]), 1);

    result.includes(Mod[Mod.Perfect]) && result.splice(result.indexOf(Mod[Mod.SuddenDeath]), 1);

    return result;
}

/* Correct combined list bitwise, example (NC only -> NC + DT) */
function constrainCorrection() {
    return function (target: any, key: string) {
        let val = target[key];

        const getter = () => {
            return val;
        };

        const setter = (next: number) => {
            next & Mod.Nightcore && (next |= Mod.DoubleTime);
            next & Mod.Perfect && (next |= Mod.SuddenDeath);
            val = next;
        };

        Object.defineProperty(target, key, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true,
        });
    };
}

export { Mods, Mod };
