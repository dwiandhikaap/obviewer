import { Beatmap } from "../osu/Beatmap/Beatmap";
import { Replay } from "../osu/Replay/Replay";
import { Renderer } from "../renderer/Renderer";

interface ReplayTaleConfig {
    container: string;
}

class ReplayTale {
    private beatmap: Beatmap;
    private replay: Replay;
    private renderer: Renderer;

    private isPaused: boolean = true;
    private timestamp: number = 0;

    public playbackRate: number = 1;

    constructor(replaytaleConfig: ReplayTaleConfig) {
        const { container } = replaytaleConfig;
        this.renderer = new Renderer(container);
    }

    loadBeatmap(beatmap: Beatmap) {
        this.beatmap = beatmap;
        this.renderer.loadBeatmap(beatmap);
    }

    loadReplay(replay: Replay) {
        this.replay = replay;
        //this.canvas.setMods(replay.mods);
    }

    private lastFrameTimestamp: number = 0;
    private loop = (time: number) => {
        if (this.isPaused) return;

        const deltaTime = time - this.lastFrameTimestamp;
        this.timestamp += deltaTime * this.playbackRate;
        this.renderer.timestamp += deltaTime * this.playbackRate;
        this.lastFrameTimestamp = time;

        requestAnimationFrame(this.loop);
    };

    start() {
        this.isPaused = false;
        this.lastFrameTimestamp = performance.now();
        this.loop(this.lastFrameTimestamp);
    }

    stop() {
        this.isPaused = true;
    }

    seek(timestamp: number) {
        this.timestamp = timestamp;
        this.renderer.timestamp = timestamp;
    }
}

export { ReplayTale };