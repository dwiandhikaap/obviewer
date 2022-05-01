import { MathHelper } from "../../../../../math/MathHelper";
import { Easer } from "../../../../../math/Easer";
import { Mod } from "../../../../Mods/Mods";
import { Slider, SliderReverseTick, SliderTick } from "../Slider";

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
        tickOpacity.addEasing(fadeEnd, sliderTick.time, 1, 0.3, "InQuad");

        tickScale.addEasing(fadeStart, fadeEnd, 0, 1, "OutElastic");
        tickScale.addEasing(fadeEnd, sliderTick.time, 1, 1);

        this.opacity = tickOpacity;
        this.scale = tickScale;
    }

    update(time: number) {
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
        tickOpacity.addEasing(tickFadeStart + 300, reverseTime, 1, 1);

        // Scale beat every 300ms
        const tickScale = new Easer(1);
        const tickStart = reverseTime - slideDuration * 2;
        const tickEnd = reverseTime;

        for (let i = tickStart; i < tickEnd; i += 300) {
            tickScale.addEasing(i, i + 300, 1, 0.6);
        }

        this.opacity = tickOpacity;
        this.scale = tickScale;
    }

    update(time: number) {
        this.opacity.time = time;
        this.scale.time = time;
    }
}

class DrawableSlider {
    progress: number;
    progressPosition: [number, number];
    isVisible: boolean;
    isSliding: boolean;
    isReversed: boolean;
    slideIndex: number;

    bodyOpacity: Easer;
    headOpacity: Easer;
    ballOpacity: Easer;

    approachCircleOpacity: Easer;
    approachCircleScale: Easer;

    constructor(public slider: Slider) {
        const diff = slider.difficulty;
        const fadeIn = diff.fadeIn;
        const preempt = diff.getPreempt();

        const bodyOpacity: Easer = new Easer();
        const headOpacity: Easer = new Easer();
        const appearTime = slider.startTime - preempt;

        if (diff.mods.contains(Mod.Hidden)) {
            bodyOpacity.addEasing(appearTime, appearTime + fadeIn, 0, 1);
            bodyOpacity.addEasing(appearTime + fadeIn, slider.endTime, 1, 0, "OutQuad");

            headOpacity.addEasing(appearTime, appearTime + preempt * 0.4, 0, 1);
            headOpacity.addEasing(appearTime + preempt * 0.4, appearTime + preempt * 0.7, 1, 0);
        } else {
            bodyOpacity.addEasing(appearTime, appearTime + fadeIn, 0, 1);
            bodyOpacity.addEasing(appearTime + fadeIn, slider.endTime, 1, 1);
            bodyOpacity.addEasing(slider.endTime, slider.endTime + 150, 1, 0);

            headOpacity.addEasing(appearTime, appearTime + fadeIn, 0, 1);
            headOpacity.addEasing(appearTime + fadeIn, slider.endTime, 1, 1);
            headOpacity.addEasing(slider.endTime, slider.endTime + 150, 1, 0);
        }

        const ballOpacity = new Easer(0);
        ballOpacity.addEasing(slider.startTime, slider.endTime, 1, 1);

        const approachCircleOpacity: Easer = new Easer(0);

        if (diff.mods.contains(Mod.Hidden)) {
            if (slider.objectIndex === 0) {
                approachCircleOpacity.addEasing(0, Math.min(fadeIn * 2, preempt), 0, 1);
                approachCircleOpacity.addEasing(Math.min(fadeIn * 2, preempt), Math.min(fadeIn * 2, preempt) * 2, 1, 0);
            }
        } else {
            approachCircleOpacity.addEasing(appearTime, appearTime + Math.min(fadeIn * 2, preempt), 0, 1);
            approachCircleOpacity.addEasing(appearTime + Math.min(fadeIn * 2, preempt), slider.startTime, 1, 1);
        }

        const approachCircleScale: Easer = new Easer(1);

        approachCircleScale.addEasing(appearTime, slider.startTime, 4, 1);

        this.progress = 0;
        this.progressPosition = slider.getPositionAt(0);
        this.isVisible = false;
        this.isSliding = false;
        this.isReversed = false;
        this.slideIndex = 0;
        this.bodyOpacity = bodyOpacity;
        this.headOpacity = headOpacity;
        this.ballOpacity = ballOpacity;
        this.approachCircleOpacity = approachCircleOpacity;
        this.approachCircleScale = approachCircleScale;
    }

    update(time: number) {
        this.progress = MathHelper.Clamp((time - this.slider.startTime) / this.slider.duration, 0, 1);
        this.progressPosition = this.slider.getStackedPositionAt(time);
        this.isVisible = this.slider.isVisibleAt(time);
        this.isSliding = time >= this.slider.startTime && time <= this.slider.endTime;
        this.slideIndex = this.slider.getSlideIndexAt(time);
        this.isReversed = this.slider.getSlideDirectionAt(time) === -1;
        this.bodyOpacity.time = time;
        this.headOpacity.time = time;
        this.ballOpacity.time = time;
        this.approachCircleOpacity.time = time;
        this.approachCircleScale.time = time;
    }
}

export { DrawableReverseTick, DrawableSlider, DrawableSliderTick };
