import { Spannable } from "../../../../../math/Spannable";
import { Mod } from "../../../../Mods/Mods";
import { HitCircle } from "../HitCircle";

export class DrawableHitCircle {
    opacity: Spannable;
    approachCircleOpacity: Spannable;
    approachCircleScale: Spannable;

    constructor(public hitObject: HitCircle) {
        const diff = hitObject.difficulty;
        const fadeIn = diff.fadeIn;
        const preempt = diff.getPreempt();
        const opacity: Spannable = new Spannable();
        const appearTime = hitObject.startTime - preempt;

        if (diff.mods.contains(Mod.Hidden)) {
            opacity.addSpan(appearTime, appearTime + preempt * 0.4, 0, 1);
            opacity.addSpan(appearTime + preempt * 0.4, appearTime + preempt * 0.7, 1, 0);
        } else {
            opacity.addSpan(appearTime, appearTime + fadeIn, 0, 1);
            opacity.addSpan(appearTime + fadeIn, hitObject.endTime, 1, 1);
            opacity.addSpan(hitObject.startTime, hitObject.startTime + 150, 1, 0);
        }

        const approachCircleOpacity: Spannable = new Spannable(0);

        if (diff.mods.contains(Mod.Hidden)) {
            if (hitObject.objectIndex === 0) {
                approachCircleOpacity.addSpan(0, Math.min(fadeIn * 2, preempt), 0, 1);
                approachCircleOpacity.addSpan(Math.min(fadeIn * 2, preempt), Math.min(fadeIn * 2, preempt) * 2, 1, 0);
            }
        } else {
            approachCircleOpacity.addSpan(appearTime, appearTime + Math.min(fadeIn * 2, preempt), 0, 1);
            approachCircleOpacity.addSpan(appearTime + Math.min(fadeIn * 2, preempt), hitObject.startTime, 1, 1);
        }

        const approachCircleScale: Spannable = new Spannable(1);
        approachCircleScale.addSpan(appearTime, hitObject.startTime, 4, 1);

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
