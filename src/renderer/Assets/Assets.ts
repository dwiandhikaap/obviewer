import { Loader, LoaderResource, Texture, utils } from "pixi.js";
import assetsConfig from "./assets.json";

interface IAssetsData {
    sync: string[][];
    async: string[][];
}

class AssetsLoader {
    private static loaderSync: Loader;
    private static loaderAsync: Loader;

    public static assets: utils.Dict<LoaderResource> = {};
    private static _cachedTextures: { [key: string]: Texture } = {};

    private static _staticConstructor = (function () {
        AssetsLoader.loaderSync = new Loader();
        AssetsLoader.loaderAsync = new Loader();

        const assetsData: IAssetsData = assetsConfig;

        const syncData = assetsData.sync;
        syncData.forEach((data) => {
            const [assetsName, assetsPath] = data;
            AssetsLoader.loaderSync.add(assetsName, assetsPath);
        });

        AssetsLoader.loaderSync.onStart.add(() => {
            console.log("[Assets Loader] Sync Loader - Start");
        });

        AssetsLoader.loaderSync.onComplete.add(() => {
            console.log("[Assets Loader] Sync Loader - Completed");
        });

        AssetsLoader.loaderAsync.onStart.add(() => {
            console.log("[Assets Loader] Async Loader - Start");
        });

        AssetsLoader.loaderAsync.onComplete.add(() => {
            console.log("[Assets Loader] Async Loader - Completed");
        });
    })();

    static async load() {
        this.loadAsync();
        await this.loadSync();

        for (const key in this.loaderSync.resources) {
            if (this.loaderSync.resources.hasOwnProperty(key)) {
                const element = this.loaderSync.resources[key];
                this.assets[key] = element;
            }
        }

        for (const key in this.loaderAsync.resources) {
            if (this.loaderAsync.resources.hasOwnProperty(key)) {
                const element = this.loaderAsync.resources[key];
                this.assets[key] = element;
            }
        }
    }

    private static async loadSync() {
        const loader = new Promise((resolve, reject) => {
            this.loaderSync.onComplete.add(resolve);
            this.loaderSync.onError.add(reject);

            this.loaderSync.load();
        });

        await loader;
    }

    private static loadAsync() {
        this.loaderAsync.load();
    }

    private static _getCachedTexture(name: string) {
        return this._cachedTextures[name];
    }

    private static _setCachedTexture(name: string, texture: Texture) {
        this._cachedTextures[name] = texture;
    }

    // utils.TextureCache is kinda fucky
    public static getTexture(name: string): Texture {
        const cached = this._getCachedTexture(name);

        if (!cached || !cached.valid) {
            const texture = (this.assets[name].texture || Texture.EMPTY).clone();
            this._setCachedTexture(name, texture);
        }

        return this._getCachedTexture(name);
    }
}

export { AssetsLoader };
