import { Howl } from "howler";
import { omitFileExtension } from "../util/filename";

export class AudioHandler {
    constructor() {}

    public loadedAudio: { [name: string]: { instance: Howl; url: string } } = {};

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

    public add(name: string, instance: Howl, url: string) {
        this.find(name)?.instance.stop();

        this.loadedAudio[name] = { instance, url };
    }

    public async getHTMLAudio(name: string) {
        const url = this.find(name)?.url;

        if (url === undefined) return;

        const audio = await new Promise<Howl>((resolve) => {
            const howl = new Howl({
                src: url,
                format: ["mp3", "wav", "mpga", "ogg"],
                onload: () => {
                    resolve(howl);
                },
                onloaderror: () => {
                    resolve(howl);
                },
                html5: true,
            });
        });

        return { instance: audio, url: url };
    }

    public play(name: string) {
        this.find(name)?.instance.play();
    }

    public playOnce(name: string) {
        this.find(name)?.instance.pause();
        this.find(name)?.instance.play();
    }

    public playOnceAsync(name: string) {
        return new Promise((resolve) => {
            this.find(name)?.instance.once("play", resolve);

            this.find(name)?.instance.pause();
            this.find(name)?.instance.play();
        });
    }

    public pause(name: string) {
        this.find(name)?.instance.pause();
    }

    public stop(name: string) {
        this.find(name)?.instance.stop();
    }

    public seek(name: string, time: number) {
        this.find(name)?.instance.seek(time);
    }

    public getCurrentTime(name: string) {
        return (this.find(name)?.instance.seek() ?? 0) * 1000;
    }
}
