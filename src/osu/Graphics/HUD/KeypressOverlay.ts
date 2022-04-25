import { KeypressType } from "../../Replay/ReplayNodes";

type HitKeys = Exclude<KeypressType, "SMOKE">;
type HitKeysDict = Record<HitKeys, number>;

interface KeypressHitInfo {
    hitCount: HitKeysDict;
    keypress: Set<HitKeys>;
}

class KeypressOverlay {
    private _time: number;
    public get time(): number {
        return this._time;
    }
    public set time(time: number) {
        this._time = time;
    }

    hitCount: HitKeysDict = {
        K1: 0,
        K2: 0,
        M1: 0,
        M2: 0,
    };

    latestPulseTime: Record<HitKeys, number | null> = {
        K1: null,
        K2: null,
        M1: null,
        M2: null,
    };

    update(keypressInfo: KeypressHitInfo) {
        this.hitCount = keypressInfo.hitCount;
        keypressInfo.keypress.forEach((key) => {
            this.latestPulseTime[key] = this.time;
        });
    }
}

export { KeypressOverlay, KeypressHitInfo };
