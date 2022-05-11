import { Animation } from "../../../../../math/Animation";
import { Easer } from "../../../../../math/Easer";
import { Mod } from "../../../../Mods/Mods";
import { HitCircle } from "../HitCircle";
import { DrawableHitObject } from "./DrawableHitObject";

type HitCircleAnimation = "SHAKE" | "HIT" | "MISS";

export class DrawableHitCircle extends DrawableHitObject<HitCircleAnimation> {
    opacity: Easer;
    approachCircleOpacity: Easer;
    approachCircleScale: Easer;

    // Easer for event-based animation/transformation, triggered by class method `animate(...)`
    positionOffset = {
        x: new Easer(0),
        y: new Easer(0),
    };

    constructor(public hitObject: HitCircle) {
        super();
        const diff = hitObject.difficulty;
        const fadeIn = diff.fadeIn;
        const preempt = diff.getPreempt();
        const appearTime = hitObject.startTime - preempt;

        const opacity: Easer = new Easer();
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

        const shakeAnim = new Animation("SHAKE" as HitCircleAnimation);
        const missAnim = new Animation("MISS" as HitCircleAnimation);

        this.animations.push(shakeAnim, missAnim);
    }

    draw(time: number) {
        this.opacity.time = time;
        this.approachCircleOpacity.time = time;
        this.approachCircleScale.time = time;
        this.positionOffset.x.time = time;
        this.positionOffset.y.time = time;
    }

    animate(animation: HitCircleAnimation, time: number) {
        switch (animation) {
            case "SHAKE": {
                this.playAnimation("SHAKE", this.positionOffset.x, shake(time));
                break;
            }

            case "MISS": {
                this.playAnimation("MISS", this.opacity, miss(time));
                this.playAnimation("MISS", this.approachCircleOpacity, miss(time));
                break;
            }
        }
    }
}

function shake(time: number) {
    const shakeoffset = 7;
    const shakeTimeStep = 50;

    const right = Easer.CreateEasing(time, time + shakeTimeStep, 0, shakeoffset);
    const left = Easer.CreateEasing(time + shakeTimeStep, time + shakeTimeStep * 3, shakeoffset, -shakeoffset);
    const center = Easer.CreateEasing(time + shakeTimeStep * 3, time + shakeTimeStep * 4, -shakeoffset, 0, "OutBounce");

    return [right, left, center];
}

function miss(time: number) {
    const fadeOutTime = 80;
    const fadeOut = Easer.CreateEasing(time, time + fadeOutTime, 1, 0);
    const invisible = Easer.CreateEasing(time + fadeOutTime, time + 1000, 0, 0);
    return [fadeOut, invisible];
}
