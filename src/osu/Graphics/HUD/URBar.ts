import { Easer } from "../../../math/Easer";
import { UnstableRate } from "../../Gameplay/UnstableRate";
import { HUDComponent } from "./HUDComponent";

var UR_TICK_DURATION = 9000;

interface URTick {
    offset: number;
    time: number;
    color: number;
    opacity: Easer;
}

class URBar implements HUDComponent {
    private _time: number;
    public get time(): number {
        return this._time;
    }
    public set time(time: number) {
        this._time = time;
    }

    public ticks: URTick[] = [];
    public urValue: number = 0;

    public update(unstableRate: UnstableRate) {
        this.urValue = unstableRate.value;

        if (unstableRate.hitErrors.length === 0) {
            return;
        }

        const newHitErrorCount = unstableRate.hitErrors.length - this.ticks.length;
        if (newHitErrorCount < 0) {
            this.ticks.slice(0, unstableRate.hitErrors.length);
            return;
        }

        const startIndex = this.ticks.length;
        const endIndex = this.ticks.length + newHitErrorCount;

        for (let i = startIndex; i < endIndex; i++) {
            const hitError = unstableRate.hitErrors[i];

            const tickOpacity = new Easer().addEasing(hitError.time, hitError.time + UR_TICK_DURATION, 0.75, 0);

            let color = 0xff0000;

            switch (hitError.result) {
                case 100: {
                    color = 0x97f06a;
                    break;
                }

                case 50: {
                    0xebd198;
                    break;
                }

                default: {
                    color = 0xb6e8f6;
                }
            }

            this.ticks.push({
                offset: hitError.offset,
                time: hitError.time,
                opacity: tickOpacity,
                color: color,
            });
        }
    }

    public getTickIndexAt(time: number) {
        return Math.min(this.ticks.length, Math.max(0, searchIndex(this.ticks, Math.max(0, time))));
    }
}

function searchIndex(ticks: URTick[], time: number) {
    let left = 0;
    let right = ticks.length - 1;
    let mid = 0;

    while (left <= right) {
        mid = Math.floor((left + right) / 2);

        if (ticks[mid].time > time) {
            right = mid - 1;
        } else if (ticks[mid].time < time) {
            left = mid + 1;
        } else {
            return mid;
        }
    }

    return mid;
}

export { URBar };
