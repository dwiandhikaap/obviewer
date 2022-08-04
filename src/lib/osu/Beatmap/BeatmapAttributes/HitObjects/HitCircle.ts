import { DrawableHitCircle } from "./Drawable/DrawableHitCircle";
import { HitObject, HitObjectConfig } from "./HitObject";

class HitCircle extends HitObject {
    drawable: DrawableHitCircle;

    constructor(hitObjectConfig: HitObjectConfig) {
        super(hitObjectConfig);

        this.drawable = new DrawableHitCircle(this);
    }

    draw(time: number) {
        this.drawable.draw(time);
    }

    update(time: number): void {
        this.drawable.update(time);
    }
}

export { HitCircle };
