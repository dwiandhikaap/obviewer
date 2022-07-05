import { Animation } from "../../../../../math/Animation";
import { Easer, Easing } from "../../../../../math/Easer";

abstract class DrawableHitObject<T> {
    private animations: Animation<T>[] = [];

    // Called every game tick, depends on the replay node density and playback rate
    update(time: number) {
        this.removeFutureAnimation(time);
    }

    // Called every frames, ideally 60 frames per seconds / every 16.6 ms
    draw(time: number) {}

    protected playAnimation(animationType: T, easer: Easer, easings: Easing[]) {
        const animationIndex = this.animations.findIndex((anim) => anim.animationType === animationType);

        if (animationIndex === -1) {
            const animation = new Animation(animationType);
            this.animations.push(animation);
            animation.addSequence(easer, easings);
            return;
        }

        this.animations[animationIndex].addSequence(easer, easings);
    }

    protected removeFutureAnimation(time: number) {
        this.animations.forEach((anim) => {
            const futureAnimEasers = anim.animationEasers.filter((animEasers) => {
                return Math.min(...animEasers.easings.map((easing) => easing.startTime)) > time;
            });

            futureAnimEasers.forEach((pog) => {
                anim.removeSequence(pog);
            });
        });
    }

    animate(animationType: T, time: number) {}
}

export { DrawableHitObject };
