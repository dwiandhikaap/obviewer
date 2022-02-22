interface AudioOptions {
    playbackRate: number;
    offsetMS: number;
    volume: number;
}

class AudioHandler {
    public loadedAudio: { [name: string]: { audio: HTMLAudioElement; options: AudioOptions } } = {};
    constructor() {}

    loadAudio(name: string, audio: HTMLAudioElement, options?: Partial<AudioOptions>) {
        const defaultOptions: AudioOptions = {
            offsetMS: 0,
            volume: 1,
            playbackRate: 1,
        };
        Object.assign(defaultOptions, options);

        this.loadedAudio[name] = { audio, options: defaultOptions };
        const { playbackRate, offsetMS, volume } = defaultOptions;

        audio.playbackRate = playbackRate ?? 1;
        audio.currentTime = offsetMS / 1000;
        audio.volume = volume ?? 1.0;
    }

    playAudio(name: string) {
        const audio = this.loadedAudio[name].audio;
        if (!audio) return;
        audio.play();
    }

    pauseAudio(name: string) {
        const audio = this.loadedAudio[name].audio;
        if (!audio) return;
        audio.pause();
    }

    stopAudio(name: string) {
        const audio = this.loadedAudio[name].audio;
        if (!audio) return;
        audio.pause();
        audio.currentTime = this.loadedAudio[name].options.offsetMS / 1000;
    }

    setAudioOptions(name: string, options: Partial<AudioOptions>) {
        const audio = this.loadedAudio[name].audio;
        if (!audio) return;

        const audioOptions = this.loadedAudio[name].options;
        Object.assign(audioOptions, options);

        const { playbackRate, offsetMS, volume } = audioOptions;
        audio.playbackRate = playbackRate ?? audio.playbackRate;
        audio.currentTime = audio.currentTime + offsetMS / 1000;
        audio.volume = volume ?? audio.volume;
    }

    seekAudio(name: string, time: number) {
        const { audio, options } = this.loadedAudio[name];
        if (!audio) return;
        const offsetMS = options.offsetMS;
        audio.currentTime = time + offsetMS / 1000;
    }

    getAudioCurrentTimeMS(name: string) {
        const audio = this.loadedAudio[name].audio;
        if (!audio) return 0;
        return audio.currentTime * 1000;
    }

    getAudioOffsetMS(name: string) {
        const audio = this.loadedAudio[name].audio;
        if (!audio) return 0;
        return this.loadedAudio[name].options.offsetMS;
    }
}

export { AudioHandler };
