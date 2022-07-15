import { Howl } from "howler";
import { omitFileExtension } from "../util/filename";

export class AudioHandler {
    constructor() {}

    public loadedAudio: { [name: string]: Howl } = {};

    public find(name: string) {
        const audio = this.loadedAudio[name];

        if (!audio) {
            const fullFileNames = Object.keys(this.loadedAudio);
            const fileNamesOnly = fullFileNames.map(omitFileExtension);
            const index = fileNamesOnly.findIndex((key) => key === name);

            if (index > -1) {
                return this.loadedAudio[Object.keys(this.loadedAudio)[index]];
            }

            return undefined;
        }

        return audio;
    }

    public add(name: string, audio: Howl) {
        this.find(name)?.stop();

        this.loadedAudio[name] = audio;
    }

    public play(name: string) {
        this.find(name)?.play();
    }

    public playOnce(name: string) {
        this.find(name)?.pause();
        this.find(name)?.play();
    }

    public playOnceAsync(name: string) {
        return new Promise((resolve) => {
            this.find(name)?.once("play", resolve);

            this.find(name)?.pause();
            this.find(name)?.play();
        });
    }

    public pause(name: string) {
        this.find(name)?.pause();
    }

    public stop(name: string) {
        this.find(name)?.stop();
    }

    public seek(name: string, time: number) {
        this.find(name)?.seek(time);
    }

    public getCurrentTime(name: string) {
        return (this.find(name)?.seek() ?? 0) * 1000;
    }
}
