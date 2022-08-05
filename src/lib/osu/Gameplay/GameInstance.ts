import { Howl } from "howler";
import { AudioHandler } from "../../audio/AudioHandler";
import { Renderer } from "../../renderer/Renderer";
import { Settings } from "../../settings/Settings";
import { Beatmap } from "../Beatmap/Beatmap";
import { Mod } from "../Mods/Mods";
import { Replay } from "../Replay/Replay";

class GameInstance {
    private renderer: Renderer;
    private audioHandler: AudioHandler;

    private beatmap?: Beatmap;
    private replay?: Replay;

    private beatmapAudio?: Howl;

    private _rate: number = 1;
    public get rate(): number {
        return this._rate;
    }
    public set rate(value: number) {
        this._rate = value;
        this.beatmapAudio?.rate(value);
    }

    private _time: number;
    public get time(): number {
        return this._time;
    }
    public set time(time: number) {
        this._time = time;

        this.draw(time);
    }

    public isPlaying = false;

    constructor(renderer: Renderer, audioHandler: AudioHandler) {
        this.renderer = renderer;
        this.audioHandler = audioHandler;
    }

    public async loadBeatmap(beatmap: Beatmap) {
        this.beatmap = beatmap;
        this.handleMods(beatmap);
        await this.reloadAudio();
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

                    if (Math.abs(performance.now() - this._autoSyncLastTime) > 200) {
                        this._autoSyncCount = 0;
                    }
                    this._autoSyncLastTime = performance.now();
                }
            }
        }

        if (this._autoSyncCount > 50) {
            console.warn("[Audio] Auto sync issue detected! Disabling audio auto sync!");
            Settings.set("AudioAutoSyncEnabled", false);
            this._autoSyncCount = 0;
        }
    }

    private async reloadAudio() {
        if (!this.beatmap) return;

        const audioFilename = this.beatmap.getAudioFilename();
        this.beatmapAudio?.pause();
        this.beatmapAudio?.unload();
        this.beatmapAudio = await this.getAudioInstance(audioFilename);
        this.beatmapAudio?.seek(this.time / 1000);
        this.beatmapAudio?.rate(this.rate);

        if (this.isPlaying) {
            this.beatmapAudio?.play();
        }
    }

    // avoiding circular dependency by not passing
    // the whole app instance to the constructor, (rollup warning)
    public _setAppRate: (rate: number) => void = () => {};
    private handleMods(beatmap: Beatmap) {
        if (beatmap.getMods().hasSimilar(Mod.DoubleTime)) {
            this._setAppRate(1.5);
        } else if (beatmap.getMods().hasSimilar(Mod.HalfTime)) {
            this._setAppRate(0.75);
        }
    }

    private async getAudioInstance(audioFilename: string) {
        const mods = this.beatmap?.getMods();
        if ((mods?.contains(Mod.DoubleTime) && !mods?.contains(Mod.Nightcore)) || mods?.contains(Mod.HalfTime)) {
            return await this.audioHandler.getHTMLAudio(audioFilename)?.then((audio) => audio?.instance);
        }
        return this.audioHandler.find(audioFilename)?.instance;
    }
}

export { GameInstance };
