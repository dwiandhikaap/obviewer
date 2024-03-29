import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";
import { AssetsLoader } from "../../assets/Assets";
import { Beatmap } from "../../osu/Beatmap/Beatmap";
import { omitFileExtension } from "../../util/filename";

interface BackgroundConfig {
    texture?: Texture;
    brightness?: number;
    fit?: "none" | "horizontal" | "vertical";
}

class Background extends Container {
    private blackRect = new Graphics();
    private backgroundSprite = new Sprite();
    private _brightness: number = 1;
    private fit = "none";

    get brightness() {
        return this._brightness;
    }

    set brightness(brightnessValue: number) {
        if (brightnessValue > 1) {
            this._brightness = 1;
        } else if (brightnessValue < 0) {
            this._brightness = 0;
        } else {
            this._brightness = brightnessValue;
        }

        this.backgroundSprite.alpha = this.brightness;
    }

    private get canvasWidth() {
        return this.application.view.width;
    }

    private get canvasHeight() {
        return this.application.view.height;
    }

    constructor(private application: Application, backgroundConfig?: BackgroundConfig) {
        super();

        this.blackRect.beginFill(0x000000);
        this.blackRect.drawRect(0, 0, this.canvasWidth, this.canvasHeight);

        const bgAnchorX = this.canvasWidth / 2;
        const bgAnchorY = this.canvasHeight / 2;

        this.backgroundSprite.transform.position.set(bgAnchorX, bgAnchorY);
        this.backgroundSprite.anchor.set(0.5, 0.5);

        this.addChild(this.blackRect);
        this.addChild(this.backgroundSprite);

        if (!backgroundConfig) return;

        const { texture, brightness, fit } = backgroundConfig;

        this._brightness = brightness ?? 1;
        fit && (this.fit = fit);
        texture && this.setImage(texture);
    }

    setImage(texture: Texture) {
        this.backgroundSprite.alpha = this.brightness;
        this.backgroundSprite.texture = texture;

        switch (this.fit) {
            case "horizontal": {
                const scale = this.canvasWidth / texture.width;
                this.backgroundSprite.scale.set(scale);
                break;
            }

            case "vertical": {
                const scale = this.canvasHeight / texture.height;
                this.backgroundSprite.scale.set(scale);
                break;
            }
        }
    }

    loadBeatmap(beatmap: Beatmap) {
        const fullFileName = beatmap.getBackgroundFileNames()[0] || "";
        const fileName = omitFileExtension(fullFileName);
        const texture = AssetsLoader.instance.getTexture(fileName);

        this.setImage(texture);
    }

    draw(timestamp: number) {}
}

export { Background };
