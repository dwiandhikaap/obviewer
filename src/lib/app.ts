import { Beatmap } from "./osu/Beatmap/Beatmap";
import { GameInstance } from "./osu/Gameplay/GameInstance";
import { Mods } from "./osu/Mods/Mods";
import { Replay } from "./osu/Replay/Replay";
import { Renderer } from "./renderer/Renderer";
import { AssetsReference, getBeatmapDependencies, AssetsLoader, getSkinDependencies } from "./assets/Assets";
import { AudioHandler } from "./audio/AudioHandler";
import { audioMiddleware } from "./audio/audioMiddleware";
import { Settings } from "./settings/Settings";

interface ObviewerConfig {
    container: string;
}

class Obviewer {
    private beatmapAssets: AssetsReference = [];
    private skinAssets: AssetsReference = [];

    replay: Replay | null = null;
    beatmap: Beatmap | null = null;

    public isModsOverriden: Boolean = false;
    private _replayModsNumeric: number | null;
    private mods: Mods | null = null;

    private renderer: Renderer;
    private audioHandler: AudioHandler;
    private gameInstance: GameInstance;
    private assetsLoader: AssetsLoader;

    public isPaused: boolean = true;
    private timestamp: number = 0;

    public get time() {
        return this.timestamp;
    }

    private _rate: number = 1;
    public get rate(): number {
        return this._rate;
    }
    public set rate(value: number) {
        this._rate = value;
        this.gameInstance.rate = value;
    }

    private _duration = 0;
    public get duration() {
        return this._duration;
    }

    constructor(obviewerConfig: ObviewerConfig) {
        const { container } = obviewerConfig;
        this.renderer = new Renderer(container);
        this.audioHandler = new AudioHandler();
        this.gameInstance = new GameInstance(this.audioHandler);
        this.gameInstance._setAppRate = (rate: number) => {
            this.rate = rate;
        };

        this.assetsLoader = AssetsLoader.instance;

        const middleware = audioMiddleware(this.audioHandler);
        this.assetsLoader.use(middleware);

        Howler.volume(Settings.get("AudioVolume"));
    }

    addSkin(skinAssets: AssetsReference) {
        this.assetsLoader.resetSkin();
        this.skinAssets = skinAssets;
    }

    addBeatmap(beatmapAssets: AssetsReference) {
        this.beatmapAssets = beatmapAssets;

        //  Debug only
        //const osuFiles = beatmapAssets.filter((asset) => getFileExtension(asset.name) === "osu");
        //console.log(osuFiles);
    }

    async load(filename: string, replay?: Replay) {
        await this.loadBeatmap(filename);
        if (replay) {
            this.loadReplay(replay);
        }
    }

    private async loadBeatmap(filename: string) {
        const difficultyFile = this.beatmapAssets.find((asset) => asset.name === filename);
        if (!difficultyFile) {
            console.error(`Beatmap '${filename}' not found`);
            return;
        }

        const beatmapString = await fetch(difficultyFile.url).then((response) => response.text());

        const isPlaying = !this.isPaused;
        this.pause();

        const beatmap = new Beatmap(beatmapString, this.mods ?? undefined);
        const beatmapDeps = getBeatmapDependencies(this.beatmapAssets, beatmap);
        const skinDeps = getSkinDependencies(this.skinAssets);

        this.assetsLoader.resetSkin();
        this.assetsLoader.resetBeatmap();

        await this.assetsLoader.loadSkin(skinDeps);
        await this.assetsLoader.loadBeatmap(beatmapDeps);

        this.beatmap = beatmap;
        await this.gameInstance.loadBeatmap(beatmap);
        this.renderer.loadBeatmap(beatmap);

        this._duration = this.gameInstance.getMaximumDuration();

        if (isPlaying) {
            this.play();
        }
    }

    checkResources() {
        console.log(AssetsLoader.instance.resources);
    }

    private loadReplay(replay: Replay) {
        this._replayModsNumeric = replay.mods.numeric;

        if (this.mods !== null) {
            replay.mods = this.mods;
        }

        if (this.beatmap && this.beatmap.getMods().numeric !== replay.mods.numeric) {
            this.beatmap.setMods(replay.mods);
        }

        this.replay = replay;
        this.renderer.loadReplay(replay);
    }

    enableModsOverride(mods: Mods) {
        // console.log(`Enabling Overrides : ${mods.list}`);

        this.isModsOverriden = true;
        if (mods.numeric === this.mods?.numeric) {
            return;
        }

        this.mods = mods;
        this.replay && (this.replay.mods = mods);
        const oldMods = this.beatmap?.getMods().numeric;

        if (this.beatmap && oldMods !== mods.numeric) {
            this.beatmap.setMods(mods);
            this.renderer.loadBeatmap(this.beatmap);
        }
    }

    disableModsOverride() {
        // console.log(`Disabling Overrides! Previous Beatmap Mods : ${this.beatmap?.getMods().list}`);

        this.mods = null;
        this.isModsOverriden = false;
        if (this._replayModsNumeric === null) {
            return;
        }

        const oldReplayMods = new Mods(this._replayModsNumeric);
        const oldMapMods = this.beatmap?.getMods().numeric;

        this.replay && (this.replay.mods = oldReplayMods);
        if (this.beatmap && oldMapMods !== oldReplayMods.numeric) {
            this.beatmap.setMods(oldReplayMods);
            this.renderer.loadBeatmap(this.beatmap);
        }
    }

    private lastFrameTimestamp: number = 0;
    private _rafID?: number;
    private loop = (time: number) => {
        if (this.isPaused) return;

        if (this.timestamp > this.duration) {
            this.pause();
            return;
        }

        let deltaTime = time - this.lastFrameTimestamp;

        this.timestamp += deltaTime * this._rate;
        this.gameInstance.time = this.timestamp;
        this.renderer.timestamp = this.timestamp;
        this.lastFrameTimestamp = time;

        this._rafID = requestAnimationFrame(this.loop);
    };

    play() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.gameInstance.play();
        this.lastFrameTimestamp = performance.now();
        this.loop(this.lastFrameTimestamp);
    }

    pause() {
        this.isPaused = true;
        this.gameInstance.pause();

        if (this._rafID !== undefined) {
            cancelAnimationFrame(this._rafID);
        }
    }

    seek(timestamp: number) {
        timestamp = Math.min(Math.max(0, timestamp), this.duration);

        this.timestamp = timestamp;
        this.renderer.timestamp = timestamp;
        this.gameInstance.time = timestamp;
    }
}

export { Obviewer };
export * from "./osu/Mods/Mods";
export * from "./osu/Replay/Replay";
export * from "./osu/Beatmap/Beatmap";
export * from "./settings/Settings";
export * as utils from "./util";
