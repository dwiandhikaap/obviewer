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
    public constrain = true;

    private _numeric: number;
    private _list = new Array<Mod>();

    constructor(value: number = 0) {
        this._numeric = value;
    }

    public get reducedListString() {
        let reducedMods = reduceCombinedMods(this._list);

        return reducedMods.map((mod) => Mod[mod]);
    }

    public get listString() {
        return this._list.map((mod) => Mod[mod]);
    }

    public get reducedList() {
        return reduceCombinedMods(this._list);
    }

    public get list() {
        return this._list;
    }

    public get numeric() {
        return this._numeric;
    }

    public set numeric(value: number) {
        if (value <= 0) {
            this._numeric = 0;
            this._list = [Mod.None];
            return;
        }

        let result = new Array<Mod>();
        let sum = 0;

        value
            .toString(2)
            .split("")
            .map(Number)
            .reverse()
            .forEach((currentValue, index) => {
                if (currentValue === 1) {
                    result.push(currentValue << index);
                    sum += currentValue << index;
                }
            });

        this._numeric = sum;
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

    private _enable(...mods: Mod[]) {
        mods.forEach((mod) => (this.numeric |= mod));
    }

    private _disable(...mods: Mod[]) {
        mods.forEach((mod) => (this.numeric ^= this.numeric & mod));
    }

    public enable(mod: Mod) {
        if (!this.constrain) {
            this._enable(mod);
            return;
        }

        if ([Mod.DoubleTime, Mod.Nightcore, Mod.HalfTime].includes(mod)) {
            this._disable(Mod.DoubleTime, Mod.Nightcore, Mod.HalfTime);
        }

        if ([Mod.Easy, Mod.HardRock].includes(mod)) {
            this._disable(Mod.Easy, Mod.HardRock);
        }

        if (
            [
                Mod.NoFail,
                Mod.Relax,
                Mod.Relax2,
                Mod.SuddenDeath,
                Mod.Perfect,
            ].includes(mod)
        ) {
            this._disable(
                Mod.NoFail,
                Mod.Relax,
                Mod.Relax2,
                Mod.SuddenDeath,
                Mod.Perfect
            );
            this._disable(Mod.Autoplay);
        }

        if ([Mod.SpunOut, Mod.Relax2].includes(mod)) {
            this._disable(Mod.SpunOut, Mod.Relax2);
        }

        if ([Mod.Autoplay].includes(mod)) {
            this._disable(
                Mod.NoFail,
                Mod.Relax,
                Mod.Relax2,
                Mod.SuddenDeath,
                Mod.Perfect
            );
        }

        if (mod === Mod.Nightcore) {
            this._enable(Mod.DoubleTime);
        }

        if (mod === Mod.Perfect) {
            this._enable(Mod.SuddenDeath);
        }

        this._enable(mod);
        return this;
    }

    public disable(mod: Mod) {
        if (!this.constrain) {
            this._disable(mod);
            return;
        }

        if (mod === Mod.DoubleTime) {
            this._disable(Mod.Nightcore);
        }

        if (mod === Mod.Nightcore && this.contains(Mod.Nightcore)) {
            this._disable(Mod.DoubleTime);
        }

        if (mod === Mod.SuddenDeath) {
            this._disable(Mod.Perfect);
        }

        if (mod === Mod.Perfect && this.contains(Mod.Perfect)) {
            this._disable(Mod.SuddenDeath);
        }

        this._disable(mod);
        return this;
    }
}

/* Reduce from "[..., Nightcore, DoubleTime]" to [..., Nightcore] */
function reduceCombinedMods(list: Array<Mod>) {
    const result = [...list];

    // fancy oneliners are bad bro
    if (result.includes(Mod.Nightcore)) {
        const index = result.indexOf(Mod.DoubleTime);
        if (index !== -1) {
            result.splice(index, 1);
        }
    }

    if (result.includes(Mod.Perfect)) {
        const index = result.indexOf(Mod.SuddenDeath);
        if (index !== -1) {
            result.splice(index, 1);
        }
    }

    return result;
}

export { Mods, Mod };
