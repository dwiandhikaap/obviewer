import { HitObject, HitObjectConfig } from "./HitObject";

class Spinner extends HitObject {
    constructor(hitObjectConfig: HitObjectConfig, public endTime: number) {
        super(hitObjectConfig);
    }
}

export { Spinner };
