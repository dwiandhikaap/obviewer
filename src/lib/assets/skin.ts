import { AnimatedSprite, LoaderResource, Texture, utils } from "pixi.js";
import { compareNameOnly, getFileExtension, isRetinaFile, omitFileExtension } from "../util/filename";
import { Unarray } from "../util/typing";
import { AssetsReference } from "./Assets";
import assetsDeps from "./required_assets.json";

export function createAnimatable(filename: string, resources: utils.Dict<LoaderResource>) {
    const filesWithExtension = Object.keys(resources);
    const filesWithoutExtension = filesWithExtension.map(omitFileExtension);
    const normalizedFilenames = filesWithoutExtension.map((name) => name.replace("@2x", ""));

    const animationTextures: Texture[] = [];

    const singleSpriteIndex = normalizedFilenames.findIndex((assetName) => assetName === filename);
    if (singleSpriteIndex > -1) {
        const key = filesWithExtension[singleSpriteIndex];
        const resource = resources[key];
        animationTextures.push(resource.texture ?? Texture.EMPTY);
    } else {
        for (let i = 0; i < normalizedFilenames.length; i++) {
            const targetName = filename + i.toString();
            const spriteIndex = normalizedFilenames.findIndex((assetName) => assetName === targetName);

            if (spriteIndex === -1) break;

            const key = filesWithExtension[spriteIndex];
            const resource = resources[key];
            animationTextures.push(resource.texture ?? Texture.EMPTY);
        }
    }

    return new AnimatedSprite(animationTextures);
}

// Naive implementation to retrieve the files just by it's asset name only (see required_assets.json),
// Given the asset name, it will return assets reference of related files with correct priority
// Priority Order: assetsName{index}@2x -> assetsName@2x -> assetsName{index} -> assetsName

// If indexed files were found, it will start from 0 and increment until the next sequence is not found
// assetsName-0.png -> assetsName-1.png -> assetsName-2.png -> assetsName-3.png --X--> assetsName-5.png
// because assetsName-4.png is not found, it will stop at assetsName-3.png

// If no indexed files were found, it will fallback to unindexed files (assetsName.png or assetsName@2x.png)
// Could've use regex, but it might be slow, (haven't tested it tho)
function getAnimationAssets(assets: AssetsReference, imageDep: Unarray<typeof assetsDeps.image>) {
    // Filter out assets that are not part of animation sequences
    const mixedSequence = assets.filter((skinAsset) => {
        const skinAssetName = omitFileExtension(skinAsset.name);
        const substr = skinAssetName.substring(0, imageDep.name.length);

        if (substr !== imageDep.name) return false;

        const normalizedName = skinAssetName.replace("@2x", "");
        if (normalizedName === imageDep.name) return true;

        const hyphen = imageDep.nohyphen ? "" : "-";
        const indexString = normalizedName.replace(imageDep.name + hyphen, "");

        return !isNaN(parseInt(indexString));
    });

    // Prioritize retina files, if it doesn't exist, fallback to regular files
    let sequence = mixedSequence.filter((sequence) => isRetinaFile(sequence.name));
    if (sequence.length === 0) {
        sequence = mixedSequence;
    }

    // Return assets with correctly formatted name
    // that is going to be used on the renderer code
    // (no file extension, no retina tag, no index, no hyphen separator for the index if any)
    let orderedSequence: AssetsReference = [];

    // Gather animation sequences by index
    for (let i = 0; i < sequence.length; i++) {
        const image = sequence.find((sequence) => {
            const normalizedName = omitFileExtension(sequence.name).replace("@2x", "");
            const hyphen = imageDep.nohyphen ? "" : "-";
            const matchingString = imageDep.name + hyphen + i.toString();
            return normalizedName === matchingString;
        });

        if (!image) break;

        // Remove hyphen separator if exists
        // (we can't just use .replace("@2x", "") because some assets actually have hyphen on it's name)
        // ( example: spinner-circle@2x.png )
        const fileExtension = getFileExtension(image.name);
        const retinaTag = isRetinaFile(image.name) ? "@2x" : "";
        image.name = imageDep.name + i.toString() + retinaTag + "." + fileExtension;
        image.sequenceIndex = i;

        orderedSequence.push(image);
    }

    // If no indexed files were found, fallback to unindexed files
    if (orderedSequence.length === 0) {
        const image = sequence.find((sequence) => {
            const normalizedName = omitFileExtension(sequence.name).replace("@2x", "");
            return imageDep.name === normalizedName;
        });

        if (image) {
            // Remove hyphen separator if exists
            const fileExtension = getFileExtension(image.name);
            const retinaTag = isRetinaFile(image.name) ? "@2x" : "";
            image.name = imageDep.name + retinaTag + "." + fileExtension;
            image.sequenceIndex = 0;

            orderedSequence.push(image);
        }
    }

    return orderedSequence;
}

export function addImageDependencies(assets: AssetsReference, result: AssetsReference, missingAssets: string[]) {
    const imageDeps = assetsDeps.image;
    imageDeps.forEach((imageDep) => {
        if (imageDep.animatable) {
            const animationAssets = getAnimationAssets(assets, imageDep);
            result.push(...animationAssets);
            return;
        }

        let assetReference = assets.find((asset) => compareNameOnly(asset.name, imageDep.name + "@2x"));
        assetReference = assetReference ?? assets.find((asset) => compareNameOnly(asset.name, imageDep.name));
        if (assetReference) {
            result.push(assetReference);
        } else {
            missingAssets.push(imageDep.name);
        }
    });
}

export function addAudioDependencies(assets: AssetsReference, result: AssetsReference, missingAssets: string[]) {
    const audioDeps = assetsDeps.audio;
    audioDeps.forEach((audioDep) => {
        let assetReference = assets.find((asset) => compareNameOnly(asset.name, audioDep.name));
        if (assetReference) {
            result.push(assetReference);
        } else {
            missingAssets.push(audioDep.name);
        }
    });
}
