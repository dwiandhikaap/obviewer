import { Application, Container } from "pixi.js";
import { Beatmap } from "../../osu/Beatmap/Beatmap";
import { Overlay } from "../../osu/Graphics/Overlay";
import { getPlayfieldScale } from "../../util";
import { DrawableFlashlight } from "../Drawable/Overlay/DrawableFlashlight";

class OverlayLayer extends Container {
    private overlay: Overlay;
    private flashlightOverlay: DrawableFlashlight;
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

        this.position.set(translateX, translateY);
    }

    loadBeatmap(beatmap: Beatmap) {
        const scale = getPlayfieldScale(this.playfieldResolution[0], this.playfieldResolution[1]);

        this.flashlightOverlay = new DrawableFlashlight(this.overlay.flashlightOverlay, scale);

        this.addChild(this.flashlightOverlay);
    }

    loadOverlay(overlay: Overlay) {
        this.overlay = overlay;
    }

    draw(time: number) {
        this.flashlightOverlay.draw(time);
    }
}

export { OverlayLayer };
