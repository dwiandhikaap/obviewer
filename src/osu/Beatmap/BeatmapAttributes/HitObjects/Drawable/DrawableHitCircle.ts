import { Easer } from "../../../../../math/Easer";
import { Mod } from "../../../../Mods/Mods";
import { HitCircle } from "../HitCircle";

export class DrawableHitCircle {
    opacity: Easer;
    approachCircleOpacity: Easer;
    approachCircleScale: Easer;

    constructor(public hitObject: HitCircle) {
        const diff = hitObject.difficulty;
        const fadeIn = diff.fadeIn;
        const preempt = diff.getPreempt();
        const opacity: Easer = new Easer();
        const appearTime = hitObject.startTime - preempt;

        if (diff.mods.contains(Mod.Hidden)) {
            opacity.addEasing(appearTime, appearTime + preempt * 0.4, 0, 1);
            opacity.addEasing(appearTime + preempt * 0.4, appearTime + preempt * 0.7, 1, 0);
        } else {
            opacity.addEasing(appearTime, appearTime + fadeIn, 0, 1);
            opacity.addEasing(appearTime + fadeIn, hitObject.endTime, 1, 1);
            opacity.addEasing(hitObject.startTime, hitObject.startTime + 150, 1, 0);
        }

        const approachCircleOpacity: Easer = new Easer(0);

        if (diff.mods.contains(Mod.Hidden)) {
            if (hitObject.objectIndex === 0) {
                approachCircleOpacity.addEasing(0, Math.min(fadeIn * 2, preempt), 0, 1);
                approachCircleOpacity.addEasing(Math.min(fadeIn * 2, preempt), Math.min(fadeIn * 2, preempt) * 2, 1, 0);
            }
        } else {
            approachCircleOpacity.addEasing(appearTime, appearTime + Math.min(fadeIn * 2, preempt), 0, 1);
            approachCircleOpacity.addEasing(appearTime + Math.min(fadeIn * 2, preempt), hitObject.startTime, 1, 1);
        }

        const approachCircleScale: Easer = new Easer(1);
        approachCircleScale.addEasing(appearTime, hitObject.startTime, 4, 1);

        this.opacity = opacity;
        this.approachCircleOpacity = approachCircleOpacity;
        this.approachCircleScale = approachCircleScale;
    }

    update(time: number) {
        this.opacity.time = time;
        this.approachCircleOpacity.time = time;
        this.approachCircleScale.time = time;
    }
}
