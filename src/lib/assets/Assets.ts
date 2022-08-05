import { AnimatedSprite, ILoaderMiddleware, IResourceMetadata, Loader, LoaderResource, Texture, utils } from "pixi.js";
import { Beatmap } from "../osu/Beatmap/Beatmap";
import { compareNameOnly, isRetinaFile, omitFileExtension } from "../util/filename";
import { addAudioDependencies, addImageDependencies, createAnimatable } from "./skin";

type OnCompleteCallback = (resources: utils.Dict<LoaderResource>) => void;

type AssetsReference = {
    name: string;
    url: string;
    mimeType: string;

    metadata?: any;
    sequenceIndex?: number;
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
    public getTexture(name: string): Texture {
        const cached = this._getCachedTexture(name);
        let nameWithExtension = "";

        if (!cached || !cached.valid) {
            nameWithExtension = this.findAssetFullName(name + "@2x", this.resources);
            if (!nameWithExtension) {
                nameWithExtension = this.findAssetFullName(name, this.resources);
            }

            const texture = (this.resources[nameWithExtension]?.texture || Texture.EMPTY).clone();

            this._setCachedTexture(nameWithExtension, texture);
        }

        return this._getCachedTexture(nameWithExtension);
    }

    public getAnimation(name: string): AnimatedSprite {
        return createAnimatable(name, this.resources);
    }

    private findAssetFullName(name: string, resource: utils.Dict<LoaderResource>) {
        const filesWithExtension = Object.keys(resource);
        const filesWithoutExtension = filesWithExtension.map(omitFileExtension);

        let index = filesWithoutExtension.indexOf(name);

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
            const { name, url, mimeType, sequenceIndex } = element;
            let metadata: IResourceMetadata = { mimeType: mimeType };

            metadata = {
                ...metadata,
                resolution: isRetinaFile(name) ? 2 : 1,
                resourceOptions: { sequenceIndex },
            };

            loader.add(name, url, { xhrType: LoaderResource.XHR_RESPONSE_TYPE.BLOB, metadata: metadata });
        });

        loader.onError.add((error) => {
            reject(error.message);
        });

        loader.load(() => {
            resolve();
        });
    });
}

// TODO: deal with missing assets dependencies
function getBeatmapDependencies(beatmapAssets: AssetsReference, beatmap: Beatmap) {
    const dependencies: AssetsReference = [];
    const beatmapDeps = beatmap.getAssetsFilename();

    beatmapDeps.forEach((depFilename) => {
        let assetReference = beatmapAssets.find((asset) => compareNameOnly(asset.name, depFilename + "@2x"));
        assetReference = assetReference ?? beatmapAssets.find((asset) => compareNameOnly(asset.name, depFilename));
        if (assetReference) {
            dependencies.push(assetReference);
        }
    });

    return dependencies;
}

function getSkinDependencies(skinAssets: AssetsReference) {
    const dependencies: AssetsReference = [];
    const missingAssets: string[] = [];

    addImageDependencies(skinAssets, dependencies, missingAssets);
    addAudioDependencies(skinAssets, dependencies, missingAssets);

    if (missingAssets.length > 0) {
        console.warn(`Missing assets: ${missingAssets.join(", ")}`);
    }

    return dependencies;
}

export { AssetsLoader, AssetsReference, getBeatmapDependencies, getSkinDependencies };
