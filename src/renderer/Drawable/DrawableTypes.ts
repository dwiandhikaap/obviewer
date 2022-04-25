import { Container } from "pixi.js";
import { HitCircleDrawable } from "./HitObject/HitCircleDrawable";
import { SliderDrawable } from "./HitObject/SliderDrawable";
import { SpinnerDrawable } from "./HitObject/SpinnerDrawable";
import { CursorNode } from "./Replay/CursorNode";
import { CursorTrail } from "./Replay/CursorTrail";
import { MainCursor } from "./Replay/MainCursor";

export { HitCircleDrawable, SliderDrawable };
export { CursorNode, CursorTrail, MainCursor };

export interface Drawable extends Container {
    draw(time: number): void;
}

export type HitObjectDrawable = HitCircleDrawable | SliderDrawable | SpinnerDrawable;
