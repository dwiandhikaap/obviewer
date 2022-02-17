import { MathHelper } from "../../../../math/MathHelper";
import { Path } from "../../../../math/Path";
import { Spannable } from "../../../../math/Spannable";
import { Vector2 } from "../../../../math/Vector2";
import { TimingPoints } from "../TimingPoints";
import { HitObject, HitObjectConfig } from "./HitObject";

class SliderTick {
    constructor(public time: number, public position: [number, number]) {}
}

class SliderReverseTick extends SliderTick {
    constructor(time: number, position: [number, number], public opacity: Spannable, public isReversed: boolean) {
        super(time, position);
    }
}

interface SliderState {
    progress: number;
    progressPosition: [number, number];
    hit: boolean;
    isVisible: boolean;
    isSliding: boolean;
    isReversed: boolean;
    slideIndex: number;

    opacity: Spannable;
    headOpacity: Spannable;
    ballOpacity: Spannable;

    approachCircleOpacity: Spannable;
    approachCircleScale: Spannable;
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
    slides: number;
    length: number;
    edgeSounds: number[];
    edgeSets: string[][];

    startAngle: number;
    endAngle: number;

    duration: number;

    sliderTicks: SliderTick[] = [];
    reverseTicks: SliderReverseTick[] = [];

    state: SliderState;

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
        this.state = this.initializeState();
    }

    private initializeTiming() {
        const sliderStartTime = this.startTime;

        const timing = this.timing.getInheritedTimingAt(sliderStartTime);
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
        const timing = this.timing.getInheritedTimingAt(this.startTime);

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

                    const tick = new SliderTick(tickTime, tickPos);
                    sliderTicks.push(tick);
                }
            } else {
                for (let j = tickCountPerSlide - 1; j >= 0; j--) {
                    const tickTime =
                        this.startTime + sliderSlideDuration - (j + 1) * sliderTickDuration + i * sliderSlideDuration;
                    const tickPos = this.getPositionAt(tickTime);

                    const tick = new SliderTick(tickTime, tickPos);
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

            const tickOpacity = new Spannable(0);
            const tickFadeStart =
                i === 1
                    ? this.startTime - this.difficulty.preEmpt + this.difficulty.fadeIn
                    : this.startTime + slideDuration * (i - 2);
            tickOpacity.addSpan(tickFadeStart, tickFadeStart + 250, 0, 1);
            tickOpacity.addSpan(tickFadeStart + 250, reverseTime - 1, 1, 1);
            tickOpacity.addSpan(reverseTime - 1, reverseTime, 1, 0);

            const reverseTick = new SliderReverseTick(reverseTime, reversePos, tickOpacity, isReversed);
            reverseTicks.push(reverseTick);
        }

        return reverseTicks;
    }

    private initializeState(): SliderState {
        const diff = this.difficulty;
        const { preEmpt, fadeIn } = diff;

        const opacity: Spannable = new Spannable();
        const appearTime = this.startTime - preEmpt;

        opacity.addSpan(appearTime, appearTime + fadeIn, 0, 1);
        opacity.addSpan(appearTime + fadeIn, this.endTime, 1, 1);
        opacity.addSpan(this.endTime, this.endTime + 150, 1, 0);

        const headOpacity: Spannable = new Spannable();
        headOpacity.addSpan(this.startTime, this.startTime + 150, 1, 0);

        const ballOpacity = new Spannable(0);
        ballOpacity.addSpan(this.startTime, this.endTime, 1, 1);

        const approachCircleOpacity: Spannable = new Spannable(0);
        approachCircleOpacity.addSpan(appearTime, appearTime + Math.min(fadeIn * 2, preEmpt), 0, 1);
        approachCircleOpacity.addSpan(appearTime + Math.min(fadeIn * 2, preEmpt), this.startTime, 1, 1);

        const approachCircleScale: Spannable = new Spannable(1);
        approachCircleScale.addSpan(appearTime, this.startTime, 4, 1);

        return {
            progress: 0,
            progressPosition: this.getPositionAt(0),
            hit: false,
            isVisible: false,
            isSliding: false,
            isReversed: false,
            slideIndex: 0,

            opacity: opacity,
            headOpacity: headOpacity,
            ballOpacity: ballOpacity,
            approachCircleOpacity: approachCircleOpacity,
            approachCircleScale: approachCircleScale,
        };
    }

    updateState(time: number, hit?: boolean) {
        this.state.progress = MathHelper.Clamp((time - this.startTime) / this.duration, 0, 1);
        this.state.progressPosition = this.getStackedPositionAt(time);
        this.state.isVisible = this.isVisibleAt(time);
        this.state.isSliding = time >= this.startTime && time <= this.endTime;
        this.state.slideIndex = this.getSlideIndexAt(time);
        this.state.isReversed = this.getSlideDirectionAt(time) === -1;
        this.state.opacity.time = time;
        this.state.headOpacity.time = time;
        this.state.ballOpacity.time = time;
        this.state.approachCircleOpacity.time = time;
        this.state.approachCircleScale.time = time;

        if (hit !== undefined) {
            this.state.hit = hit;
        }
    }

    getPositionAt(time: number) {
        time = MathHelper.Clamp(time, this.startTime, this.endTime);
        const slideIndex = this.getSlideIndexAt(time);

        const t1 = (time - this.startTime) / (this.duration / this.slides) - slideIndex;
        const t2 = slideIndex % 2 === 0 ? t1 : 1 - t1;

        return this.curvePath.getPointAt(t2).toTuple();
    }

    getStackedPositionAt(time: number): [number, number] {
        const position = this.getPositionAt(time);

        return [position[0] - this.stackOffset, position[1] - this.stackOffset];
    }

    getSlideDirectionAt(time: number) {
        time = MathHelper.Clamp(time, this.startTime, this.endTime);

        return this.getSlideIndexAt(time) % 2 === 0 ? 1 : -1;
    }

    getSlideIndexAt(time: number) {
        time = MathHelper.Clamp(time, this.startTime, this.endTime);

        return Math.max(0, Math.ceil(((time - this.startTime) * this.slides) / this.duration) - 1);
    }

    getCurvePath() {
        return this.curvePath;
    }

    getStackedCurvePath() {
        const path = this.curvePath.clone();
        path.translate(-this.stackOffset, -this.stackOffset);

        return path;
    }

    getSliderTicks() {
        return this.sliderTicks;
    }

    getStackedSliderTicks() {
        const ticks: SliderTick[] = [];
        for (const tick of this.sliderTicks) {
            ticks.push(
                new SliderTick(tick.time, [tick.position[0] - this.stackOffset, tick.position[1] - this.stackOffset])
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
                    tick.time,
                    [tick.position[0] - this.stackOffset, tick.position[1] - this.stackOffset],
                    tick.opacity,
                    tick.isReversed
                )
            );
        }
        return ticks;
    }
}

export { Slider, SliderTick, SliderReverseTick, SliderConfig };
