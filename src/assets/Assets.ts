import { ILoaderMiddleware, IResourceMetadata, Loader, LoaderResource, Texture, utils } from "pixi.js";
import { Beatmap } from "../osu/Beatmap/Beatmap";
import { compareNameOnly, omitFileExtension } from "../util/filename";
import assetsDeps from "./assets.json";

type OnCompleteCallback = (resources: utils.Dict<LoaderResource>) => void;

type AssetsReference = {
    name: string;
    url: string;
    mimeType: string;
}[];

class AssetsLoader {
    private constructor() {}
    private static _instance: AssetsLoader;
    public static get instance(): AssetsLoader {
        return this._instance ?? (this._instance = new AssetsLoader());
    }

    public use(fn: ILoaderMiddleware) {
        this.skinLoader.use(fn);
        this.beatmapLoader.use(fn);
    }

    private skinLoader = new Loader();
    private beatmapLoader = new Loader();

    private _cachedTextures: { [key: string]: Texture } = {};
    public get resources() {
        let resources: utils.Dict<LoaderResource> = {};

        if (this.ignoreBeatmapSkins) {
            resources = { ...this.beatmapLoader.resources, ...this.skinLoader.resources };
        } else {
            resources = { ...this.skinLoader.resources, ...this.beatmapLoader.resources };
        }

        return resources;
    }

    public ignoreBeatmapSkins = false;

    public loadSkin(skinElements: AssetsReference) {
        return load(this.skinLoader, skinElements);
    }

    public resetSkin() {
        utils.clearTextureCache();
        this.skinLoader.reset();
    }

    public loadBeatmap(beatmapAssets: AssetsReference) {
        return load(this.beatmapLoader, beatmapAssets);
    }

    public resetBeatmap() {
        utils.clearTextureCache();
        this.beatmapLoader.reset();
    }

    public async onComplete(callbackFn: OnCompleteCallback) {
        await Promise.all([promisifyLoader(this.skinLoader), promisifyLoader(this.beatmapLoader)]);

        callbackFn(this.resources);
    }

    private _getCachedTexture(name: string) {
        return this._cachedTextures[name];
    }

    private _setCachedTexture(name: string, texture: Texture) {
        this._cachedTextures[name] = texture;
    }

    // utils.TextureCache is kinda fucky
    public getTexture(name: string, withExtension = false): Texture {
        const cached = this._getCachedTexture(name);

        if (!cached || !cached.valid) {
            if (!withExtension) {
                name = this.findAssetFullName(name, this.resources);
            }

            const texture = (this.resources[name].texture || Texture.EMPTY).clone();

            this._setCachedTexture(name, texture);
        }

        return this._getCachedTexture(name);
    }

    private findAssetFullName(name: string, resource: utils.Dict<LoaderResource>) {
        const filesWithExtension = Object.keys(resource);
        const filesWithoutExtension = filesWithExtension.map(omitFileExtension);
        const index = filesWithoutExtension.indexOf(name);
        return filesWithExtension[index];
    }
}

function promisifyLoader(loader: Loader) {
    return new Promise<void>((resolve, reject) => {
        loader.onComplete.add(() => {
            resolve();
        });

        loader.onError.add(() => {
            reject();
        });
    });
}

function load(loader: Loader, assets: AssetsReference) {
    return new Promise<void>((resolve, reject) => {
        assets.forEach((element) => {
            const { name, url, mimeType } = element;
            const metadata: IResourceMetadata = { mimeType: mimeType };

            loader.add(name, url, { xhrType: LoaderResource.XHR_RESPONSE_TYPE.BLOB, metadata: metadata });
        });

        loader.onError.add((error) => {
            reject(error.message);
        });
        loader.load(() => resolve());
    });
}

// TODO: deal with missing assets dependencies
function getBeatmapDependencies(beatmapAssets: AssetsReference, beatmap: Beatmap) {
    const dependencies: AssetsReference = [];
    const beatmapDeps = beatmap.getAssetsFilename();

    beatmapDeps.forEach((depFilename) => {
        const assetReference = beatmapAssets.find((asset) => compareNameOnly(asset.name, depFilename));
        if (assetReference) {
            dependencies.push(assetReference);
        }
    });

    return dependencies;
}

function getSkinDependencies(skinAssets: AssetsReference) {
    const dependencies: AssetsReference = [];
    const missingAssets: string[] = [];
    const skinDeps = assetsDeps;

    (Object.keys(skinDeps) as (keyof typeof skinDeps)[]).forEach((fileType) => {
        const deps = skinDeps[fileType];
        deps.forEach((depFilename) => {
            const assetReference = skinAssets.find((asset) => compareNameOnly(asset.name, depFilename));
            if (assetReference) {
                dependencies.push(assetReference);
            } else {
                missingAssets.push(depFilename);
            }
        });
    });

    if (missingAssets.length > 0) {
        throw new Error(`Missing required assets: ${missingAssets.join(", ")}`);
    }

    return dependencies;
}

export { AssetsLoader, AssetsReference, getBeatmapDependencies, getSkinDependencies };
