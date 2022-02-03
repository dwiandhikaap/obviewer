import { Loader } from "pixi.js";
import assetsConfig from "./assets.json";

interface IAssetsData {
    sync: string[][];
    async: string[][];
}

class AssetsLoader {
    public loaderSync: Loader;
    public loaderAsync: Loader;

    constructor() {
        this.loaderSync = new Loader();
        this.loaderAsync = new Loader();

        const assetsData: IAssetsData = assetsConfig;

        const syncData = assetsData.sync;
        syncData.forEach((data) => {
            const [assetsName, assetsPath] = data;
            this.loaderSync.add(assetsName, assetsPath);
        });

        this.loaderSync.onStart.add(() => {
            console.log("[Assets Loader] Sync Loader - Start");
        });

        this.loaderSync.onComplete.add(() => {
            console.log("[Assets Loader] Sync Loader - Completed");
        });

        this.loaderAsync.onStart.add(() => {
            console.log("[Assets Loader] Async Loader - Start");
        });

        this.loaderAsync.onComplete.add(() => {
            console.log("[Assets Loader] Async Loader - Completed");
        });
    }

    async load() {
        this.loadAsync();
        await this.loadSync();
    }

    private async loadSync() {
        const loader = new Promise((resolve, reject) => {
            this.loaderSync.onComplete.add(resolve);
            this.loaderSync.onError.add(reject);

            this.loaderSync.load();
        });

        await loader;
    }

    private loadAsync() {
        this.loaderAsync.load();
    }
}

export { AssetsLoader };
