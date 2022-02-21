import { Difficulty } from "../../osu/Beatmap/BeatmapAttributes/Difficulty";
import { HitCircle, HitObject, Slider, Spinner } from "../../osu/Beatmap/BeatmapAttributes/HitObjects";
import { HitCircleDrawable, HitObjectDrawable, SliderDrawable } from "./DrawableTypes";
import { Grid, GridSize } from "./Graphics/Grid";
import { SpinnerDrawable } from "./HitObject/SpinnerDrawable";

export class DrawableGenerator {
    public static CreateGrid(width: number, height: number, gridSize: GridSize, color: number, alpha: number) {
        return new Grid(width, height, gridSize, color, alpha);
    }

    public static CreateHitObject(
        hitObject: HitObject,
        difficulty: Difficulty,
        renderScale: number
    ): HitObjectDrawable {
        if (hitObject.isHitCircle()) {
            return new HitCircleDrawable(hitObject as HitCircle, difficulty, renderScale);
        } else if (hitObject.isSlider()) {
            return new SliderDrawable(hitObject as Slider, difficulty, renderScale);
        } else {
            return new SpinnerDrawable(hitObject as Spinner, difficulty, renderScale);
        }
    }
}