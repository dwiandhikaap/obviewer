import * as PIXI from "pixi.js";
import { Beatmap } from "../osu/Beatmap/Beatmap";
import { AssetsLoader } from "./Assets/Assets";
import { Background } from "./Layers/Background";
import { BeatmapField } from "./Layers/BeatmapField";

class Renderer {
    public pixi: PIXI.Application;
    public assetsLoader = new AssetsLoader();
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

        console.log(this._timestamp);

        this.background.update();
    }

    private background: Background;
    private beatmapField: BeatmapField;

    constructor(querySelector: string) {
        // Set PIXI Application
        this.pixi = new PIXI.Application({ width: 1280, height: 720, backgroundColor: 0xffffff });

        // Set PIXI Shared Ticker
        this.ticker = PIXI.Ticker.shared;
        this.ticker.autoStart = false;
        this.ticker.stop();

        // Set Background
        this.background = new Background(this.pixi, { brightness: 0.5, fit: "horizontal" });
        this.pixi.stage.addChild(this.background);

        // Set BeatmapField
        this.beatmapField = new BeatmapField();
        this.pixi.stage.addChild(this.beatmapField);

        const view = document.querySelector(querySelector);
        view.appendChild(this.pixi.view);

        // Initialize App
        this.init();
    }

    async init() {
        // Load Assets
        await this.assetsLoader.load();
        this.assets = this.assetsLoader.loaderSync.resources;

        const bgTexture = this.assets["bg2"].texture;
        this.background.setImage(bgTexture);
    }

    loadBeatmap(beatmap: Beatmap) {
        this.beatmapField.loadBeatmap(beatmap);
    }
}

export { Renderer };
