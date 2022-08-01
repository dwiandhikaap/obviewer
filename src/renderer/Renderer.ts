import * as PIXI from "pixi.js";
import { Beatmap } from "../osu/Beatmap/Beatmap";
import { Overlay } from "../osu/Graphics/Overlay";
import { Replay } from "../osu/Replay/Replay";
import { Settings } from "../settings/Settings";
import { SliderTextureGenerator } from "./Drawable/HitObject/SliderTextureGenerator";
import { FlashlightTextureGenerator } from "./Drawable/Overlay/FlashlightTextureGenerator";
import { Background, BeatmapField, OverlayLayer, ReplayField } from "./Layers";

class Renderer {
    public pixi: PIXI.Application;
    public assets: PIXI.utils.Dict<PIXI.LoaderResource>;

    // Timestamp and Ticker
    private ticker: PIXI.Ticker;
    private _timestamp: number = 0;

    get timestamp() {
        return this._timestamp;
    }

    set timestamp(time: number) {
        this._timestamp = time;
        this.ticker.update(time);

        this.background.draw(time);
        this.beatmapField.draw(time);
        this.replayField.draw(time);
        this.overlay.draw(time);
    }

    private background: Background;
    private beatmapField: BeatmapField;
    private replayField: ReplayField;
    private overlay: OverlayLayer;

    constructor(querySelector: string) {
        // Set PIXI Application
        this.pixi = new PIXI.Application({
            powerPreference: "high-performance",
            antialias: true,
            width: Settings.get("AppWidth"),
            height: Settings.get("AppHeight"),
            backgroundColor: 0xffffff,
        });

        // Set PIXI Shared Ticker
        this.ticker = PIXI.Ticker.shared;
        this.ticker.autoStart = false;
        this.ticker.stop();

        // Set TextureRenderer Renderer
        SliderTextureGenerator.setRenderer(this.pixi.renderer as PIXI.Renderer);
        FlashlightTextureGenerator.setRenderer(this.pixi.renderer as PIXI.Renderer);

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

        // Set HUDOverlay
        this.overlay = new OverlayLayer(this.pixi);
        this.overlay.interactiveChildren = false;
        this.pixi.stage.addChild(this.overlay);

        const view = document.querySelector(querySelector);
        view && view.appendChild(this.pixi.view);
    }

    loadBeatmap(beatmap: Beatmap) {
        this.beatmapField.loadBeatmap(beatmap);
        this.background.loadBeatmap(beatmap);
        this.overlay.loadBeatmap(beatmap);
    }

    loadReplay(replay: Replay) {
        this.replayField.loadReplay(replay);
    }

    loadOverlay(overlay: Overlay) {
        this.overlay.loadOverlay(overlay);
    }
}

export { Renderer };
