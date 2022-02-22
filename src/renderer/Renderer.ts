import * as PIXI from "pixi.js";
import { Texture } from "pixi.js";
import { Beatmap } from "../osu/Beatmap/Beatmap";
import { Replay } from "../osu/Replay/Replay";
import { AssetsLoader } from "./Assets/Assets";
import { SliderTextureGenerator } from "./Drawable/HitObject/SliderTextureGenerator";
import { Background } from "./Layers/Background";
import { BeatmapField } from "./Layers/BeatmapField";
import { ReplayField } from "./Layers/ReplayField";

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
        this.replayField.update(value);
    }

    private background: Background;
    private beatmapField: BeatmapField;
    private replayField: ReplayField;

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
        SliderTextureGenerator.setRenderer(this.pixi.renderer as PIXI.Renderer);

        // Set Background
        this.background = new Background(this.pixi, { brightness: 0.25, fit: "horizontal" });
        this.background.interactiveChildren = false;
        this.pixi.stage.addChild(this.background);

        // Set BeatmapField
        this.beatmapField = new BeatmapField(this.pixi);
        this.beatmapField.interactiveChildren = false;
        this.pixi.stage.addChild(this.beatmapField);

        // Set ReplayField
        this.replayField = new ReplayField(this.pixi);
        this.replayField.interactiveChildren = false;
        this.pixi.stage.addChild(this.replayField);

        const view = document.querySelector(querySelector);
        view && view.appendChild(this.pixi.view);

        // Initialize App
        this.init();
    }

    async init() {
        // Load Assets
        await AssetsLoader.load();
        this.assets = AssetsLoader.assets;

        console.log(this.pixi.view.getContext("webgl2"));
    }

    loadBeatmap(beatmap: Beatmap) {
        this.beatmapField.loadBeatmap(beatmap);
    }

    loadReplay(replay: Replay) {
        this.replayField.loadReplay(replay);
    }

    setBackground(image: HTMLImageElement) {
        const texture = Texture.from(image);
        this.background.setImage(texture);
    }
}

export { Renderer };
