import { MathHelper } from "../../../../../math/MathHelper";
import { Spannable } from "../../../../../math/Spannable";
import { Mod } from "../../../../Mods/Mods";
import { Slider, SliderReverseTick, SliderTick } from "../Slider";

class DrawableSliderTick {
    opacity: Spannable;
    scale: Spannable;

    constructor(public sliderTick: SliderTick) {
        const tickOpacity = new Spannable(0);
        const tickScale = new Spannable(0);

        const fadeStart = sliderTick.time - 400;
        const fadeEnd = sliderTick.time - 300;

        tickOpacity.addSpan(fadeStart, fadeEnd, 0, 1);
        tickOpacity.addSpan(fadeEnd, sliderTick.time, 1, 1);
        tickScale.addSpan(fadeStart, sliderTick.time - 200, 0, 1);
        tickScale.addSpan(sliderTick.time - 200, sliderTick.time, 1, 1);

        this.opacity = tickOpacity;
        this.scale = tickScale;
    }

    update(time: number) {
        this.opacity.time = time;
        this.scale.time = time;
    }
}

class DrawableReverseTick {
    opacity: Spannable;
    scale: Spannable;

    constructor(public reverseTick: SliderReverseTick) {
        const slider = reverseTick.slider;
        const slideDuration = Math.floor(slider.duration / slider.slides);
        const reverseTime = reverseTick.time;

        const tickOpacity = new Spannable(0);
        const tickFadeStart = reverseTime - slideDuration * 2;
        tickOpacity.addSpan(tickFadeStart, tickFadeStart + 300, 0, 1);
        tickOpacity.addSpan(tickFadeStart + 300, reverseTime, 1, 1);

        // Scale beat every 300ms
        const tickScale = new Spannable(1);
        const tickStart = reverseTime - slideDuration * 2;
        const tickEnd = reverseTime;

        for (let i = tickStart; i < tickEnd; i += 300) {
            tickScale.addSpan(i, i + 300, 1, 0.6);
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

    opacity: Spannable;
    headOpacity: Spannable;
    ballOpacity: Spannable;

    approachCircleOpacity: Spannable;
    approachCircleScale: Spannable;

    constructor(public slider: Slider) {
        const diff = slider.difficulty;
        const fadeIn = diff.fadeIn;
        const preempt = diff.getPreempt();

        const opacity: Spannable = new Spannable();
        const appearTime = slider.startTime - preempt;

        if (diff.mods.contains(Mod.Hidden)) {
            opacity.addSpan(appearTime, appearTime + fadeIn, 0, 1);
            opacity.addSpan(appearTime + fadeIn, slider.endTime, 1, 0);
        } else {
            opacity.addSpan(appearTime, appearTime + fadeIn, 0, 1);
            opacity.addSpan(appearTime + fadeIn, slider.endTime, 1, 1);
            opacity.addSpan(slider.endTime, slider.endTime + 150, 1, 0);
        }

        const headOpacity: Spannable = new Spannable();
        headOpacity.addSpan(slider.startTime, slider.startTime + 150, 1, 0);

        const ballOpacity = new Spannable(0);
        ballOpacity.addSpan(slider.startTime, slider.endTime, 1, 1);

        const approachCircleOpacity: Spannable = new Spannable(0);

        if (diff.mods.contains(Mod.Hidden)) {
            if (slider.objectIndex === 0) {
                approachCircleOpacity.addSpan(0, Math.min(fadeIn * 2, preempt), 0, 1);
                approachCircleOpacity.addSpan(Math.min(fadeIn * 2, preempt), Math.min(fadeIn * 2, preempt) * 2, 1, 0);
            }
        } else {
            approachCircleOpacity.addSpan(appearTime, appearTime + Math.min(fadeIn * 2, preempt), 0, 1);
            approachCircleOpacity.addSpan(appearTime + Math.min(fadeIn * 2, preempt), slider.startTime, 1, 1);
        }

        const approachCircleScale: Spannable = new Spannable(1);

        approachCircleScale.addSpan(appearTime, slider.startTime, 4, 1);

        this.progress = 0;
        this.progressPosition = slider.getPositionAt(0);
        this.isVisible = false;
        this.isSliding = false;
        this.isReversed = false;
        this.slideIndex = 0;
        this.opacity = opacity;
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
        this.opacity.time = time;
        this.headOpacity.time = time;
        this.ballOpacity.time = time;
        this.approachCircleOpacity.time = time;
        this.approachCircleScale.time = time;
    }
}

export { DrawableReverseTick, DrawableSlider, DrawableSliderTick };
