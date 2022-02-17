import * as PIXI from "pixi.js";
import { Texture } from "pixi.js";
import { Beatmap } from "../osu/Beatmap/Beatmap";
import { AssetsLoader } from "./Assets/Assets";
import { SliderTextureGenerator } from "./Drawable/HitObject/SliderTextureGenerator";
import { Background } from "./Layers/Background";
import { BeatmapField } from "./Layers/BeatmapField";

class Renderer {
    public pixi: PIXI.Application;
    public assets: PIXI.utils.Dict<PIXI.LoaderResource>;

    // Timestamp and Ticker
    private ticker: PIXI.Ticker;
    private _timestamp: number = 0;

    get timestamp() {
        return this._timestamp;
    }

    set timestamp(value: number) {
        this._timestamp = value;
        this.ticker.update(value);

        this.background.update(value);
        this.beatmapField.update(value);
    }

    private background: Background;
    private beatmapField: BeatmapField;

    constructor(querySelector: string) {
        // Set PIXI Application
        this.pixi = new PIXI.Application({
            powerPreference: "high-performance",
            antialias: true,
            width: 1280,
            height: 720,
            backgroundColor: 0xffffff,
        });

        // Set PIXI Shared Ticker
        this.ticker = PIXI.Ticker.shared;
        this.ticker.autoStart = false;
        this.ticker.stop();

        // Set TextureRenderer Renderer
        // TODO: in case there are many TextureRenderers that need to be set, create a class that does that
        SliderTextureGenerator.setRenderer(this.pixi.renderer as PIXI.Renderer);

        // Set Background
        this.background = new Background(this.pixi, { brightness: 0.2, fit: "horizontal" });
        this.background.interactiveChildren = false;
        this.pixi.stage.addChild(this.background);

        // Set BeatmapField
        this.beatmapField = new BeatmapField(this.pixi);
        this.beatmapField.interactiveChildren = false;
        this.pixi.stage.addChild(this.beatmapField);

        const view = document.querySelector(querySelector);
        view && view.appendChild(this.pixi.view);

        // Initialize App
        this.init();
    }

    async init() {
        // Load Assets
        await AssetsLoader.load();
        this.assets = AssetsLoader.assets;

        const bgTexture = this.assets["bg2"].texture || Texture.EMPTY;
        this.background.setImage(bgTexture);
    }

    loadBeatmap(beatmap: Beatmap) {
        this.beatmapField.loadBeatmap(beatmap);
    }
}

export { Renderer };
