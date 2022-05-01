import { Easer } from "../../../../math/Easer";
import { DrawableSpinner } from "./Drawable/DrawableSpinner";
import { HitObject, HitObjectConfig } from "./HitObject";

class Spinner extends HitObject {
    drawable: DrawableSpinner;

    constructor(hitObjectConfig: HitObjectConfig) {
        super(hitObjectConfig);

        this.drawable = new DrawableSpinner(this);
    }

    update(time: number): void {
        this.drawable.update(time);
    }
}

export { Spinner };
