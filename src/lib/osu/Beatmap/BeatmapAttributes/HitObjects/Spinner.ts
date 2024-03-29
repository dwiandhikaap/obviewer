import { DrawableSpinner } from "./Drawable/DrawableSpinner";
import { HitObject, HitObjectConfig } from "./HitObject";

class Spinner extends HitObject {
    drawable: DrawableSpinner;

    constructor(hitObjectConfig: HitObjectConfig) {
        super(hitObjectConfig);

        this.drawable = new DrawableSpinner(this);
    }

    draw(time: number): void {
        this.drawable.draw(time);
    }
}

export { Spinner };
