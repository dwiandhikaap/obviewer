import { Container } from "pixi.js";
import { DrawableHitCircle } from "./HitObject/DrawableHitCircle";
import { DrawableSlider } from "./HitObject/DrawableSlider";
import { DrawableSpinner } from "./HitObject/DrawableSpinner";
import { CursorNode } from "./Replay/CursorNode";
import { CursorTrail } from "./Replay/CursorTrail";
import { MainCursor } from "./Replay/MainCursor";

export { DrawableHitCircle, DrawableSlider };
export { CursorNode, CursorTrail, MainCursor };

export interface Drawable extends Container {
    draw(time: number): void;
}

export type HitObjectDrawable = DrawableHitCircle | DrawableSlider | DrawableSpinner;
