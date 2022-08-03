import { MathHelper } from "../../../../math/MathHelper";
import { Path } from "../../../../math/Path";
import { Vector2 } from "../../../../math/Vector2";
import { TimingPoints } from "../TimingPoints";
import { DrawableReverseTick, DrawableSlider, DrawableSliderTick } from "./Drawable/DrawableSlider";
import { HitObject, HitObjectConfig } from "./HitObject";

class SliderTick {
    drawable: DrawableSliderTick;

    constructor(public slider: Slider, public time: number, public position: [number, number]) {
        this.drawable = new DrawableSliderTick(this);
    }
}

class SliderReverseTick {
    drawable: DrawableReverseTick;

    constructor(public slider: Slider, public time: number, public position: [number, number], public isReversed: boolean) {
        this.drawable = new DrawableReverseTick(this);
    }
}

interface SliderConfig {
    curveType: string;
    curvePoints: number[][];
    curvePath: Path;
    slides: number;
    length: number;
    edgeSounds: number[];
    edgeSets: string[][];
}

class Slider extends HitObject {
    curveType: string;
    curvePoints: number[][];
    curvePath: Path;
    stackedCurvePath: Path;
    slides: number;
    length: number;
    edgeSounds: number[];
    edgeSets: string[][];

    startAngle: number;
    endAngle: number;

    duration: number;

    sliderTicks: SliderTick[] = [];
    reverseTicks: SliderReverseTick[] = [];

    drawable: DrawableSlider;

    constructor(hitObjectConfig: HitObjectConfig, sliderConfig: SliderConfig, private timing: TimingPoints) {
        super(hitObjectConfig);

        const { curveType, curvePoints, curvePath, slides, length, edgeSounds, edgeSets } = sliderConfig;

        this.curveType = curveType;
        this.curvePoints = curvePoints;
        this.curvePath = curvePath;
        this.slides = slides;
        this.length = length;
        this.edgeSounds = edgeSounds;
        this.edgeSets = edgeSets;

        const stackedCurvePath = this.curvePath.clone();
        stackedCurvePath.translate(-this.stackOffset, -this.stackOffset);
        this.stackedCurvePath = stackedCurvePath;

        const points = this.curvePath.points;
        const s1 = points[1];
        const s2 = points[0];
        this.startAngle = Vector2.Angle(s2, s1);

        const e1 = points[points.length - 2];
        const e2 = points[points.length - 1];
        this.endAngle = Vector2.Angle(e2, e1);

        const { duration, endTime } = this.initializeTiming();
        this.duration = duration;
        this.endTime = endTime;
        this.sliderTicks = this.initializeSliderTicks();
        this.reverseTicks = this.initializeReverseTicks();

        this.drawable = new DrawableSlider(this);
    }

    private initializeTiming() {
        const sliderStartTime = this.startTime;

        const timing = this.timing.getTimingAt(sliderStartTime);
        const beatLength = timing.beatLength;
        const sliderMult = this.difficulty.sliderMultiplier;
        const sliderPixelVelocity = sliderMult * 100; // sliderMult*100 pixels for every beat

        const sliderBeatCount = (this.length * this.slides) / sliderPixelVelocity;
        const sliderDuration = sliderBeatCount * beatLength;

        const duration = sliderDuration;
        const endTime = this.startTime + sliderDuration;

        return { duration, endTime };
    }

    // TODO: fix bug where ticks fall on the different places for long fast repeating slider
    private initializeSliderTicks() {
        const timing = this.timing.getTimingAt(this.startTime);

        const sliderTickRate = this.difficulty.sliderTickRate;
        const sliderTickDuration = timing.beatLengthBase / sliderTickRate;
        const sliderSlideDuration = Math.floor(this.duration / this.slides);

        const tickCountPerSlide = Math.max(0, Math.ceil(sliderSlideDuration / sliderTickDuration) - 1);
        const sliderTicks: SliderTick[] = [];
        for (let i = 0; i < this.slides; i++) {
            const isReverse = i % 2 === 1;

            if (!isReverse) {
                for (let j = 0; j < tickCountPerSlide; j++) {
                    const tickTime = this.startTime + (j + 1) * sliderTickDuration + i * sliderSlideDuration;
                    const tickPos = this.getPositionAt(tickTime);

                    const tick = new SliderTick(this, tickTime, tickPos);
                    sliderTicks.push(tick);
                }
            } else {
                for (let j = tickCountPerSlide - 1; j >= 0; j--) {
                    const tickTime =
                        this.startTime + sliderSlideDuration - (j + 1) * sliderTickDuration + i * sliderSlideDuration;
                    const tickPos = this.getPositionAt(tickTime);

                    const tick = new SliderTick(this, tickTime, tickPos);
                    sliderTicks.push(tick);
                }
            }
        }

        return sliderTicks;
    }

    private initializeReverseTicks() {
        const reverseTicks: SliderReverseTick[] = [];

        for (let i = 1; i < this.slides; i++) {
            const slideDuration = Math.floor(this.duration / this.slides);
            const reverseTime = this.startTime + slideDuration * i;
            const reversePos = this.getPositionAt(reverseTime);

            const sliderCurvePoints = this.curvePath.points;

            let reverseAngle;
            if (i % 2 === 0) {
                const p1 = sliderCurvePoints[1];
                const p2 = sliderCurvePoints[0];

                reverseAngle = Vector2.Angle(p2, p1);
            } else {
                const p1 = sliderCurvePoints[sliderCurvePoints.length - 2];
                const p2 = sliderCurvePoints[sliderCurvePoints.length - 1];

                reverseAngle = Vector2.Angle(p2, p1);
            }
            const isReversed = i % 2 === 1;

            const reverseTick = new SliderReverseTick(this, reverseTime, reversePos, isReversed);
            reverseTicks.push(reverseTick);
        }

        return reverseTicks;
    }

    draw(time: number) {
        this.drawable.draw(time);
        this.sliderTicks.forEach((ticks) => ticks.drawable.draw(time));
        this.reverseTicks.forEach((ticks) => ticks.drawable.draw(time));
    }

    getPositionAt(time: number) {
        time = MathHelper.Clamp(time, this.startTime, this.endTime);
        const slideIndex = this.getSlideIndexAt(time);

        const t1 = (time - this.startTime) / (this.duration / this.slides) - slideIndex;
        const t2 = slideIndex % 2 === 0 ? t1 : 1 - t1;

        return this.curvePath.getPointTupleAt(t2);
    }

    getStackedPositionAt(time: number): [number, number] {
        const position = this.getPositionAt(time);

        return [position[0] - this.stackOffset, position[1] - this.stackOffset];
    }

    getSlideDirectionAt(time: number) {
        time = MathHelper.Clamp(time, this.startTime, this.endTime);

        return this.getSlideIndexAt(time) % 2 === 0 ? 1 : -1;
    }

    getBallRotationAt(time: number) {
        time = MathHelper.Clamp(time, this.startTime, this.endTime);
        const slideIndex = this.getSlideIndexAt(time);

        const t1 = (time - this.startTime) / (this.duration / this.slides) - slideIndex;
        const t2 = slideIndex % 2 === 0 ? t1 : 1 - t1;

        let angle = this.curvePath.getAngleAt(t2);

        if (slideIndex % 2 === 1) {
            angle = Math.PI + angle;
        }

        return angle;
    }

    getSlideIndexAt(time: number) {
        time = MathHelper.Clamp(time, this.startTime, this.endTime);

        return Math.max(0, Math.ceil(((time - this.startTime) * this.slides) / this.duration) - 1);
    }

    getSlideStartTime(index: number) {
        return this.startTime + (index * this.duration) / this.slides;
    }

    getCurvePath() {
        return this.curvePath;
    }

    getStackedCurvePath() {
        return this.stackedCurvePath;
    }

    getSliderTicks() {
        return this.sliderTicks;
    }

    getStackedSliderTicks() {
        const ticks: SliderTick[] = [];
        for (const tick of this.sliderTicks) {
            ticks.push(
                new SliderTick(this, tick.time, [tick.position[0] - this.stackOffset, tick.position[1] - this.stackOffset])
            );
        }
        return ticks;
    }

    getReverseTicks() {
        return this.reverseTicks;
    }

    getStackedReverseTicks() {
        const ticks: SliderReverseTick[] = [];
        for (const tick of this.reverseTicks) {
            ticks.push(
                new SliderReverseTick(
                    this,
                    tick.time,
                    [tick.position[0] - this.stackOffset, tick.position[1] - this.stackOffset],
                    tick.isReversed
                )
            );
        }
        return ticks;
    }
}

export { Slider, SliderTick, SliderReverseTick, SliderConfig };
