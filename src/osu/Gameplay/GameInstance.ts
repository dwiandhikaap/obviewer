import { Howl } from "howler";
import { AudioHandler } from "../../audio/AudioHandler";
import { Renderer } from "../../renderer/Renderer";
import { Settings } from "../../settings/Settings";
import { Beatmap } from "../Beatmap/Beatmap";
import { GameHUD } from "../Graphics/HUD/GameHUD";
import { Replay } from "../Replay/Replay";

class GameInstance {
    private renderer: Renderer;
    private audioHandler: AudioHandler;

    private beatmap?: Beatmap;
    private replay?: Replay;

    private beatmapAudio?: Howl;

    private _playbackRate: number = 1;
    public get playbackRate(): number {
        return this._playbackRate;
    }
    public set playbackRate(value: number) {
        this._playbackRate = value;
        this.beatmapAudio?.rate(value);
    }

    private _time: number;
    public get time(): number {
        return this._time;
    }
    public set time(time: number) {
        this._time = time;

        this.gameHUD.time = time;
        this.draw(time);
    }
    public isPlaying = false;

    private gameHUD: GameHUD;

    constructor(renderer: Renderer, audioHandler: AudioHandler) {
        this.renderer = renderer;
        this.audioHandler = audioHandler;

        this.gameHUD = new GameHUD(this.renderer);
    }

    public loadBeatmap(beatmap: Beatmap) {
        this.beatmap = beatmap;
        this.reloadAudio();
    }

    public loadReplay(replay: Replay) {
        this.replay = replay;
    }

    public play() {
        this.isPlaying = true;
        this.beatmapAudio?.seek(this.time / 1000);
        this.beatmapAudio?.play();
    }

    public pause() {
        this.isPlaying = false;
        this.beatmapAudio?.pause();
    }

    private draw(time: number) {
        if (!this.beatmap) return;

        const hitObjects = this.beatmap.hitObjects.objects;
        for (let i = 0; i < hitObjects.length; i++) {
            if (hitObjects[i].isVisibleAt(time)) {
                hitObjects[i].draw(time);
            }
        }

        this._autoSync(time);
    }

    // Sync audio automatically if somehow the game/audio drifts
    private _autoSyncCount = 0;
    private _autoSyncLastTime = 0;
    private averageTimeDiff: number = 0;
    private _autoSync(time: number) {
        if (Settings.get("AudioAutoSyncEnabled") && document.hasFocus() && this.beatmapAudio?.playing()) {
            const currTime = this.beatmapAudio.seek() * 1000;
            const offset = Settings.get("AudioOffset");
            const timeDiff = currTime - offset - this.time;
            this.averageTimeDiff = (this.averageTimeDiff * this._autoSyncCount + timeDiff) / (this._autoSyncCount + 1);
            //console.log(`Time diff : ${Math.abs(timeDiff)}`);
            //console.log(currTime, offset, this.time);

            if (Math.abs(timeDiff) > Settings.get("AudioAutoSyncThresholdMS")) {
                this.beatmapAudio.seek(this.time / 1000);

                // Check quick repeating autosync in short intervals
                if (Settings.get("AudioAutoSyncDetectIssue")) {
                    this._autoSyncCount++;
                    if (time - this._autoSyncLastTime > 500) {
                        this._autoSyncCount = 0;
                    }
                    this._autoSyncLastTime = time;
                }
            }
        }

        if (this._autoSyncCount > 10) {
            console.warn("[Audio] Auto sync issue detected! Disabling audio auto sync!");
            Settings.set("AudioAutoSyncEnabled", false);
            this._autoSyncCount = 0;
        }
    }

    private reloadAudio() {
        if (!this.beatmap) return;

        const audioFilename = this.beatmap.getAudioFilename();
        this.beatmapAudio?.pause();
        this.beatmapAudio = this.audioHandler.loadedAudio[audioFilename];
        this.beatmapAudio?.seek(this.time / 1000);

        if (this.isPlaying) {
            this.beatmapAudio.play();
        }
    }
}

export { GameInstance };
