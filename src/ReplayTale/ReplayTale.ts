import { Beatmap } from "../osu/Beatmap/Beatmap";
import { Replay } from "../osu/Replay/Replay";
import { AudioHandler } from "../renderer/AudioHandler";
import { Renderer } from "../renderer/Renderer";

interface ReplayTaleConfig {
    container: string;
}

class ReplayTale {
    private beatmap: Beatmap;
    private replay: Replay;

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

    loadBeatmap(beatmap: Beatmap, audio?: HTMLAudioElement, background?: HTMLImageElement) {
        this.beatmap = beatmap;
        this.renderer.loadBeatmap(beatmap);

        if (audio !== undefined) {
            this.audioHandler.loadAudio("beatmap", audio, { volume: 0.5, offsetMS: 0 });
        }

        if (background !== undefined) {
            this.renderer.setBackground(background);
        }
    }

    loadReplay(replay: Replay) {
        this.replay = replay;
        this.renderer.loadReplay(replay);
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
