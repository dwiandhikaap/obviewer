import { HitResult } from "./HitResult";

export interface HitCircleState {
    hit: boolean;
    notelock: boolean;

    hitResult: HitResult | null;

    lockNextObject: boolean;
    started: boolean;
    finished: boolean;
}

export interface SliderState {
    hit: boolean;
    notelock: boolean;
    accuracy: number;

    hitResult: HitResult | null;

    sliderBreak: boolean;
    droppedSliderEnd: boolean;

    lockNextObject: boolean;
    started: boolean;
    finished: boolean;
}

export interface SpinnerState {
    hitResult: HitResult | null;

    inertia: number;
    rpm: number;

    started: boolean;
    finished: boolean;
}

export type HitObjectState = HitCircleState | SliderState | SpinnerState;
