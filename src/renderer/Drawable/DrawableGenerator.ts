import { Difficulty } from "../../osu/Beatmap/BeatmapAttributes/Difficulty";
import { HitCircle, HitObject, Slider, Spinner } from "../../osu/Beatmap/BeatmapAttributes/HitObjects";
import { DrawableHitCircle, HitObjectDrawable, DrawableSlider } from "./DrawableTypes";
import { Grid, GridSize } from "./Graphics/Grid";
import { DrawableSpinner } from "./HitObject/DrawableSpinner";

export class DrawableGenerator {
    public static CreateGrid(width: number, height: number, gridSize: GridSize, color: number, alpha: number) {
        return new Grid(width, height, gridSize, color, alpha);
    }

    public static CreateHitObject(hitObject: HitObject, renderScale: number): HitObjectDrawable {
        if (hitObject.isHitCircle()) {
            return new DrawableHitCircle(hitObject as HitCircle, renderScale);
        } else if (hitObject.isSlider()) {
            return new DrawableSlider(hitObject as Slider, renderScale);
        } else {
            return new DrawableSpinner(hitObject as Spinner, renderScale);
        }
    }
}
