import { Application, Container, Graphics, Renderer } from "pixi.js";
import { Beatmap } from "../../osu/Beatmap/Beatmap";
import { getOsuPixelScale } from "../../util/osu-calculation";
import { DrawableGenerator } from "../Drawable/DrawableGenerator";
import { HitObjectDrawable } from "../Drawable/DrawableTypes";
import { SliderTextureGenerator } from "../Drawable/HitObject/SliderTextureGenerator";

class BeatmapField extends Container {
    private _beatmap: Beatmap;
    private hitObjectDrawables: HitObjectDrawable[] = [];
    private playfieldResolution: [number, number];

    constructor(private application: Application) {
        super();
        const canvasWidth = this.application.view.width;
        const canvasHeight = this.application.view.height;

        const playfieldScale = 4 / 5;

        // create full 4:3 out of canvas playfieldResolution above
        if (canvasHeight > (canvasWidth / 4) * 3) {
            this.playfieldResolution = [canvasWidth * playfieldScale, (canvasWidth / 4) * 3 * playfieldScale];
        } else {
            this.playfieldResolution = [(canvasHeight / 3) * 4 * playfieldScale, canvasHeight * playfieldScale];
        }

        // center playfield
        const translateX = (canvasWidth - this.playfieldResolution[0]) / 2;
        const translateY = (canvasHeight - this.playfieldResolution[1]) / 2;

        const grid = DrawableGenerator.CreateGrid(
            this.playfieldResolution[0],
            this.playfieldResolution[1],
            "LARGE",
            0xffffff,
            0.25
        );
        this.addChild(grid);
        this.position.set(translateX, translateY);
    }

    loadBeatmap(beatmap: Beatmap) {
        this._beatmap = beatmap;

        const hitObjects = this._beatmap.hitObjects;
        const difficulty = this._beatmap.difficulty;

        const scale = getOsuPixelScale(this.playfieldResolution[0], this.playfieldResolution[1]);

        hitObjects.objects.forEach((hitObject) => {
            const drawable = DrawableGenerator.CreateHitObject(hitObject, difficulty, scale);
            this.hitObjectDrawables.push(drawable);
        });

        const objectCount = Math.min(30, this.hitObjectDrawables.length);
        for (let i = objectCount - 1; i >= 0; i--) {
            this.addChild(this.hitObjectDrawables[i]);
        }
    }

    update(timestamp: number) {
        this.hitObjectDrawables.forEach((drawable) => {
            drawable.update(timestamp);
        });
    }
}

export { BeatmapField };
