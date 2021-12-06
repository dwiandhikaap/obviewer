import { HitObject, HitObjectConfig } from "./HitObject";

class HitCircle extends HitObject {
    constructor(hitObjectConfig: HitObjectConfig) {
        super(hitObjectConfig);
    }
}

export { HitCircle, HitObjectConfig };
