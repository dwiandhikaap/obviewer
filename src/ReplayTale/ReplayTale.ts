import { Beatmap } from "../osu/Beatmap/Beatmap";
import { Mod, Mods } from "../osu/Mods/Mods";
import { Replay } from "../osu/Replay/Replay";
import { AudioHandler } from "../renderer/AudioHandler";
import { Renderer } from "../renderer/Renderer";
import { Settings } from "../settings/Settings";

interface ReplayTaleConfig {
    container: string;
}

class ReplayTale {
    beatmap: Beatmap | null = null;
    replay: Replay | null = null;

    public isModsOverriden: Boolean = false;
    private _replayModsNumeric: number | null;
    private mods: Mods | null = null;

    private renderer: Renderer;
    private audioHandler: AudioHandler;

    public isPaused: boolean = true;
    private timestamp: number = 0;

    private _playbackRate: number = 1;
    public get playbackRate(): number {
        return this._playbackRate;
    }
    public set playbackRate(value: number) {
        this._playbackRate = value;
        this.audioHandler.setAudioOptions("beatmap", { playbackRate: value });
    }

    constructor(replaytaleConfig: ReplayTaleConfig) {
        const { container } = replaytaleConfig;
        this.renderer = new Renderer(container);
        this.audioHandler = new AudioHandler();
    }

    loadBeatmapAssets(audio?: HTMLAudioElement, background?: HTMLImageElement) {
        if (audio !== undefined) {
            const volume = Settings.get("AudioVolume");
            const offset = Settings.get("AudioOffset");
            this.audioHandler.loadAudio("beatmap", audio, { volume: volume / 100, offsetMS: offset });

            Settings.addUpdateListener("AudioVolume", (volume: number) => {
                this.audioHandler.setAudioOptions("beatmap", { volume: volume / 100 });
            });

            Settings.addUpdateListener("AudioOffset", (offset: number) => {
                this.audioHandler.setAudioOptions("beatmap", { offsetMS: offset });
            });
        }

        if (background !== undefined) {
            this.renderer.setBackground(background);
        }
    }

    loadBeatmap(beatmap: Beatmap) {
        if (this.mods !== null) {
            beatmap.setMods(this.mods);
        }

        if (this.mods === null && this.replay && this.replay.mods.numeric !== beatmap.getMods().numeric) {
            const mods = this.replay.mods;
            beatmap.setMods(mods);
        }

        this.beatmap = beatmap;
        this.renderer.loadBeatmap(beatmap);
    }

    loadReplay(replay: Replay) {
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
        //console.log(`Enabling Overrides : ${mods.list}`);

        this.isModsOverriden = true;

        if (mods.numeric === this.mods?.numeric) {
            return;
        }

        this.mods = mods;
        this.replay && (this.replay.mods = mods);
        if (this.beatmap) {
            const oldMods = this.beatmap.getMods().numeric;
            this.beatmap.setMods(mods);

            if (oldMods !== mods.numeric) {
                this.renderer.loadBeatmap(this.beatmap);
            }
        }
    }

    disableModsOverride() {
        //console.log(`Disabling Overrides! Previous Beatmap Mods : ${this.beatmap?.getMods().list}`);

        this.mods = null;
        if (this._replayModsNumeric === null) {
            return;
        }

        const oldReplayMods = new Mods(this._replayModsNumeric);

        this.replay && (this.replay.mods = oldReplayMods);

        if (this.beatmap) {
            const oldMapMods = this.beatmap.getMods().numeric;
            this.beatmap.setMods(oldReplayMods);

            if (oldMapMods !== oldReplayMods.numeric) {
                this.renderer.loadBeatmap(this.beatmap);
            }
        }
    }

    private lastFrameTimestamp: number = 0;
    private loop = (time: number) => {
        if (this.isPaused) return;

        let deltaTime = time - this.lastFrameTimestamp;

        this.timestamp += deltaTime * this.playbackRate;
        this.renderer.timestamp += deltaTime * this.playbackRate;
        this.lastFrameTimestamp = time;

        // self-sync audio if somehow the game drifts
        const currTime = this.audioHandler.getAudioCurrentTimeMS("beatmap");
        const offset = this.audioHandler.getAudioOffsetMS("beatmap");
        const timeDiff = currTime - offset - this.timestamp;
        if (Math.abs(timeDiff) > 150) {
            this.audioHandler.seekAudio("beatmap", this.timestamp / 1000);
        }

        requestAnimationFrame(this.loop);
    };

    play() {
        this.isPaused = false;
        this.lastFrameTimestamp = performance.now();
        this.audioHandler.playAudio("beatmap");
        this.audioHandler.seekAudio("beatmap", this.timestamp / 1000);

        this.loop(this.lastFrameTimestamp);
    }

    pause() {
        this.isPaused = true;
        this.audioHandler.pauseAudio("beatmap");
    }

    seek(timestamp: number) {
        this.timestamp = timestamp;
        this.renderer.timestamp = timestamp;
        this.audioHandler.seekAudio("beatmap", timestamp / 1000);
    }
}

export { ReplayTale };
