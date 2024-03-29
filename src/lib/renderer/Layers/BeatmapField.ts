import { Application, Container } from "pixi.js";
import { Settings } from "../../app";
import { Beatmap } from "../../osu/Beatmap/Beatmap";
import { getPlayfieldScale } from "../../util/osu-calculation";
import { DrawableGenerator } from "../Drawable/DrawableGenerator";
import { HitObjectDrawable } from "../Drawable/DrawableTypes";

class BeatmapField extends Container {
    private beatmap: Beatmap;
    private hitObjectDrawables: HitObjectDrawable[] = [];
    private playfieldResolution: [number, number];

    constructor(private application: Application) {
        super();
        const canvasWidth = this.application.view.width;
        const canvasHeight = this.application.view.height;

        // Playfield height is 80% of the screen height
        const playfieldScale = 4 / 5;

        // create full 4:3 area for the playfield
        if (canvasHeight > (canvasWidth / 4) * 3) {
            this.playfieldResolution = [canvasWidth * playfieldScale, (canvasWidth / 4) * 3 * playfieldScale];
        } else {
            this.playfieldResolution = [(canvasHeight / 3) * 4 * playfieldScale, canvasHeight * playfieldScale];
        }

        // center playfield
        const translateX = (canvasWidth - this.playfieldResolution[0]) / 2;
        const translateY = (canvasHeight - this.playfieldResolution[1]) / 2;

        if (Settings.get("ShowGrid")) {
            const grid = DrawableGenerator.CreateGrid(
                this.playfieldResolution[0],
                this.playfieldResolution[1],
                "LARGE",
                0xffffff,
                0.25
            );
            this.addChild(grid);
        }
        this.position.set(translateX, translateY);
    }

    loadBeatmap(beatmap: Beatmap) {
        this.hitObjectDrawables.forEach((obj) => obj.destroy({ texture: false, baseTexture: false, children: true }));
        this.hitObjectDrawables = [];
        this.beatmap = beatmap;

        const hitObjects = this.beatmap.hitObjects;
        const scale = getPlayfieldScale(this.playfieldResolution[0], this.playfieldResolution[1]);

        hitObjects.objects.forEach((hitObject) => {
            const drawable = DrawableGenerator.CreateHitObject(hitObject, scale);
            this.hitObjectDrawables.push(drawable);
        });

        const objectCount = this.hitObjectDrawables.length;
        for (let i = objectCount - 1; i >= 0; i--) {
            this.addChild(this.hitObjectDrawables[i]);
        }
    }

    draw(timestamp: number) {
        for (let i = 0; i < this.hitObjectDrawables.length; i++) {
            // would it be nice just to update some instead of all of them ?
            this.hitObjectDrawables[i].draw(timestamp);
        }
    }
}

export { BeatmapField };
