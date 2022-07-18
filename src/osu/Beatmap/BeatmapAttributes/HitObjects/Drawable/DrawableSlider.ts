import { MathHelper } from "../../../../../math/MathHelper";
import { Easer } from "../../../../../math/Easer";
import { Mod } from "../../../../Mods/Mods";
import { Slider, SliderReverseTick, SliderTick } from "../Slider";
import { DrawableHitObject } from "./DrawableHitObject";

class DrawableSliderTick {
    opacity: Easer;
    scale: Easer;

    constructor(public sliderTick: SliderTick) {
        const slider = sliderTick.slider;
        const tickOpacity = new Easer(0);
        const tickScale = new Easer(0);

        const slideIndex = slider.getSlideIndexAt(sliderTick.time);

        const diff = slider.difficulty;
        const preempt = diff.getPreempt();
        const appearTime = slider.startTime - preempt;

        const firstTickAppearTime = slideIndex === 0 ? appearTime : slider.getSlideStartTime(slideIndex);
        let fadeStart = firstTickAppearTime + (sliderTick.time - firstTickAppearTime) / 2 - 150;
        let fadeEnd = fadeStart + 150;

        tickOpacity.addEasing(fadeStart, fadeEnd, 0, 1);
        tickOpacity.addEasing(fadeEnd, sliderTick.time - 1, 1, 1);
        tickOpacity.addEasing(sliderTick.time - 1, sliderTick.time, 1, 0);

        tickScale.addEasing(fadeStart, fadeEnd, 0, 1, "OutElastic");
        tickScale.addEasing(fadeEnd, sliderTick.time, 1, 1);

        this.opacity = tickOpacity;
        this.scale = tickScale;
    }

    draw(time: number) {
        this.opacity.time = time;
        this.scale.time = time;
    }
}

class DrawableReverseTick {
    opacity: Easer;
    scale: Easer;

    constructor(public reverseTick: SliderReverseTick) {
        const slider = reverseTick.slider;
        const slideDuration = Math.floor(slider.duration / slider.slides);
        const reverseTime = reverseTick.time;

        const tickOpacity = new Easer(0);
        const tickFadeStart = reverseTime - slideDuration * 2;
        tickOpacity.addEasing(tickFadeStart, tickFadeStart + 300, 0, 1);
        tickOpacity.addEasing(tickFadeStart + 300, reverseTime - 1, 1, 1);
        tickOpacity.addEasing(reverseTime - 1, reverseTime, 1, 0);

        // Scale beat every 300ms
        const tickScale = new Easer(1);
        const tickStart = reverseTime - slideDuration * 2;
        const tickEnd = reverseTime;

        for (let i = tickStart; i < tickEnd; i += 300) {
            tickScale.addEasing(i, i + 300, 1.25, 1);
        }

        this.opacity = tickOpacity;
        this.scale = tickScale;
    }

    draw(time: number) {
        this.opacity.time = time;
        this.scale.time = time;
    }
}

type SliderAnimation = "FOLLOW_START" | "UNFOLLOW" | "FOLLOW_END";

class DrawableSlider extends DrawableHitObject<SliderAnimation> {
    progress: number;
    progressPosition: [number, number];
    isVisible: boolean;
    isSliding: boolean;
    isReversed: boolean;
    slideIndex: number;

    bodyOpacity: Easer;
    headOpacity: Easer;
    ballOpacity: Easer;

    followCircleOpacity: Easer;
    followCircleScale: Easer;

    approachCircleOpacity: Easer;
    approachCircleScale: Easer;

    constructor(public slider: Slider) {
        super();
        const diff = slider.difficulty;
        const fadeIn = diff.fadeIn;
        const preempt = diff.getPreempt();

        const bodyOpacity: Easer = new Easer();
        const headOpacity: Easer = new Easer();
        const appearTime = slider.startTime - preempt;

        if (diff.mods.contains(Mod.Hidden)) {
            bodyOpacity.addEasing(appearTime, appearTime + fadeIn, 0, 0.7);
            bodyOpacity.addEasing(appearTime + fadeIn, slider.endTime, 0.7, 0, "OutQuad");

            headOpacity.addEasing(appearTime, appearTime + preempt * 0.4, 0, 1);
            headOpacity.addEasing(appearTime + preempt * 0.4, appearTime + preempt * 0.7, 1, 0);
        } else {
            bodyOpacity.addEasing(appearTime, appearTime + fadeIn, 0, 0.7);
            bodyOpacity.addEasing(slider.endTime, slider.endTime + 150, 0.7, 0);

            headOpacity.addEasing(appearTime, appearTime + fadeIn, 0, 1);
            headOpacity.addEasing(slider.startTime, slider.startTime + 150, 1, 0);
        }

        const ballOpacity = new Easer(0);
        ballOpacity.addEasing(slider.startTime, slider.startTime + 1, 0, 1);
        ballOpacity.addEasing(slider.endTime, slider.endTime + 1, 1, 0);

        const followCircleOpacity = new Easer(0);
        const followCircleScale = new Easer(1);

        const approachCircleOpacity: Easer = new Easer(0);

        if (diff.mods.contains(Mod.Hidden)) {
            if (slider.objectIndex === 0) {
                approachCircleOpacity.addEasing(0, Math.min(fadeIn * 2, preempt), 0, 1);
                approachCircleOpacity.addEasing(Math.min(fadeIn * 2, preempt), Math.min(fadeIn * 2, preempt) * 2, 1, 0);
            }
        } else {
            approachCircleOpacity.addEasing(appearTime, appearTime + Math.min(fadeIn * 2, preempt), 0, 1);
            approachCircleOpacity.addEasing(appearTime + Math.min(fadeIn * 2, preempt), slider.startTime, 1, 1);
            approachCircleOpacity.addEasing(slider.startTime, slider.startTime + 150, 1, 0);
        }

        const approachCircleScale: Easer = new Easer(1);
        approachCircleScale.addEasing(appearTime, slider.startTime, 4, 1);
        approachCircleScale.addEasing(slider.startTime, slider.startTime + 100, 1, 1.05);

        this.progress = 0;
        this.progressPosition = slider.getPositionAt(0);
        this.isVisible = false;
        this.isSliding = false;
        this.isReversed = false;
        this.slideIndex = 0;
        this.bodyOpacity = bodyOpacity;
        this.headOpacity = headOpacity;
        this.ballOpacity = ballOpacity;
        this.followCircleOpacity = followCircleOpacity;
        this.followCircleScale = followCircleScale;
        this.approachCircleOpacity = approachCircleOpacity;
        this.approachCircleScale = approachCircleScale;

        this.animate("FOLLOW_START", slider.startTime);
        this.animate("FOLLOW_END", slider.endTime);
    }

    draw(time: number) {
        this.progress = MathHelper.Clamp((time - this.slider.startTime) / this.slider.duration, 0, 1);
        this.progressPosition = this.slider.getStackedPositionAt(time);
        this.isVisible = this.slider.isVisibleAt(time);
        this.isSliding = time >= this.slider.startTime && time <= this.slider.endTime;
        this.slideIndex = this.slider.getSlideIndexAt(time);
        this.isReversed = this.slider.getSlideDirectionAt(time) === -1;
        this.bodyOpacity.time = time;
        this.headOpacity.time = time;
        this.ballOpacity.time = time;
        this.followCircleOpacity.time = time;
        this.followCircleScale.time = time;
        this.approachCircleOpacity.time = time;
        this.approachCircleScale.time = time;
    }

    // TODO: create a proper "fadeTo" type of animation
    animate(animationType: SliderAnimation, time: number): void {
        switch (animationType) {
            case "FOLLOW_START": {
                this.playAnimation("FOLLOW_START", this.followCircleOpacity, followStartOpacityAnim(time));
                this.playAnimation("FOLLOW_START", this.followCircleScale, followStartScaleAnim(time));
                break;
            }

            case "UNFOLLOW": {
                this.playAnimation("UNFOLLOW", this.followCircleOpacity, unfollowOpacityAnim(time));
                this.playAnimation("UNFOLLOW", this.followCircleScale, unfollowScaleAnim(time));
                break;
            }

            case "FOLLOW_END": {
                const opacity = this.followCircleOpacity;
                const scale = this.followCircleScale;
                this.playAnimation("FOLLOW_END", opacity, followerEndOpacityAnim(opacity.getValueAt(time), time));
                this.playAnimation("FOLLOW_END", scale, followerEndScaleAnim(scale.getValueAt(time), time));
                break;
            }
        }
    }
}

const followerStartSize = 1 / 1.4;

function followStartOpacityAnim(time: number) {
    return [Easer.CreateEasing(time, time + 75, 0, 1, "OutQuad")];
}

function followStartScaleAnim(time: number) {
    return [Easer.CreateEasing(time, time + 450, followerStartSize, 1, "OutQuad")];
}

function unfollowOpacityAnim(time: number) {
    return [Easer.CreateEasing(time, time + 250, 1, 0, "OutQuad")];
}

function unfollowScaleAnim(time: number) {
    return [Easer.CreateEasing(time, time + 450, 1, 2, "OutQuad")];
}

function followerEndOpacityAnim(currentOpacity: number, time: number) {
    return [Easer.CreateEasing(time, time + 150, currentOpacity, 0, "OutQuad")];
}

function followerEndScaleAnim(currentScale: number, time: number) {
    return [Easer.CreateEasing(time, time + 250, currentScale, followerStartSize, "OutQuad")];
}

export { DrawableReverseTick, DrawableSlider, DrawableSliderTick };
