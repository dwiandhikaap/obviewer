import { Beatmap } from "../osu/Beatmap/Beatmap";
import { Replay } from "../osu/Replay/Replay";
import { Renderer } from "../renderer/Renderer";

interface RedosConfig {
    container: string;
}

class Redos {
    private beatmap: Beatmap;
    private replay: Replay;
    private renderer: Renderer;

    private isPaused: boolean = true;
    private timestamp: number = 0;

    constructor(redosConfig: RedosConfig) {
        const { container } = redosConfig;
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

    log() {
        console.log(this.renderer);
    }

    private lastFrameTimestamp: number = 0;
    private loop = () => {
        if (this.isPaused) return;

        const deltaTime = performance.now() - this.lastFrameTimestamp;
        this.timestamp += deltaTime;
        this.renderer.timestamp += deltaTime;
        this.lastFrameTimestamp = performance.now();

        requestAnimationFrame(this.loop);
    };

    unpause() {
        this.isPaused = false;
        this.lastFrameTimestamp = performance.now();
        this.loop();
    }

    pause() {
        this.isPaused = true;
    }

    seek(timestamp: number) {
        this.timestamp = timestamp;
        this.renderer.timestamp = timestamp;
    }
}

export { Redos };
