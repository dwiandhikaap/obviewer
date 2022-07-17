import { HitCircle, HitObject, Slider, Spinner } from "../../osu//Beatmap/BeatmapAttributes/HitObjects";
import { Difficulty } from "../../osu//Beatmap/BeatmapAttributes/Difficulty";
import { DrawableHitCircle, HitObjectDrawable, DrawableSlider } from "./DrawableTypes";
import { Grid, GridSize } from "./Graphics/Grid";
import { DrawableSpinner } from "./HitObject/DrawableSpinner";

export class DrawableGenerator {
    public static CreateGrid(width: number, height: number, gridSize: GridSize, color: number, alpha: number) {
        return new Grid(width, height, gridSize, color, alpha);
    }

    public static CreateHitObject(hitObject: HitObject, fieldScale: number): HitObjectDrawable {
        if (hitObject.isHitCircle()) {
            return new DrawableHitCircle(hitObject as HitCircle, fieldScale);
        } else if (hitObject.isSlider()) {
            return new DrawableSlider(hitObject as Slider, fieldScale);
        } else {
            return new DrawableSpinner(hitObject as Spinner, fieldScale);
        }
    }
}
