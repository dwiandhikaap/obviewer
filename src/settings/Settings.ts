// fuck generics

interface ISettings {
    AppWidth: number;
    AppHeight: number;
    AudioVolume: number;
    AudioOffset: number;
    AudioAutoSyncEnabled: boolean;
    AudioAutoSyncThresholdMS: number;
    AudioAutoSyncDetectIssue: boolean;
    EnableGameCheck: boolean;
}
type SettingsParameters = keyof ISettings;
type SettingsValue<T extends SettingsParameters> = ISettings[keyof Pick<ISettings, T>];
type SettingsListener<T extends SettingsParameters> = (value: SettingsValue<T>) => void;
type SettingsListenerDict = { [T in SettingsParameters]: SettingsListener<T>[] };

class Settings {
    private static _settings: ISettings = {
        AppWidth: 1280,
        AppHeight: 720,
        AudioVolume: 60,
        AudioOffset: 0,
        AudioAutoSyncEnabled: true,
        AudioAutoSyncThresholdMS: 150,
        AudioAutoSyncDetectIssue: true,
        EnableGameCheck: false,
    };

    private static listeners: SettingsListenerDict = {} as SettingsListenerDict; // hack mode

    public static addUpdateListener<K extends keyof ISettings>(key: K, listener: (value: SettingsValue<K>) => void) {
        if (this.listeners[key] === undefined) {
            this.listeners[key] = [];
        }

        (this.listeners[key] as SettingsListener<K>[]).push(listener);
    }

    public static removeUpdateListener<K extends keyof ISettings>(key: K, listener: (value: SettingsValue<K>) => void) {
        if (this.listeners[key] === undefined) {
            return;
        }

        const index = this.listeners[key]!.findIndex((val) => val === listener);
        index > -1 && this.listeners[key]!.splice(index, 1);
    }

    public static set<K extends SettingsParameters>(key: K, value: SettingsValue<K>) {
        if (this._settings[key] === value) {
            return;
        }

        this._settings[key] = value;
        this.notify(key);
    }

    public static get<K extends SettingsParameters>(key: K) {
        return this._settings[key];
    }

    public static toString() {
        return JSON.stringify(this._settings);
    }

    public static fromString(settings: string) {
        const keys = Object.keys(this._settings);
        const newSettings = JSON.parse(settings);

        for (const key of keys as SettingsParameters[]) {
            if (newSettings[key] === undefined) {
                continue;
            }

            (this._settings[key] as SettingsValue<typeof key>) = newSettings[key];
        }
    }

    private static notify<K extends SettingsParameters>(key: K) {
        if (this.listeners[key] === undefined) {
            return;
        }

        for (let listener of this.listeners[key]! as SettingsListener<K>[]) {
            const value = this._settings[key];
            listener(value);
        }
    }
}

export { Settings };
