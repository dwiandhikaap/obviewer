import * as zip from "@zip.js/zip.js";
import { Beatmap } from "../osu/Beatmap/Beatmap";
import { Replay } from "../osu/Replay/Replay";
import { FileType, getFileExtension, getFileType, omitFileExtension } from "./filename";
import * as mime from "mime/lite";
import { AssetsReference } from "../assets/Assets";

function generateBlobURL(data: Blob, fileFormat: string) {
    const mimeType = mime.getType(fileFormat) ?? undefined;
    const blob = new Blob([data], { type: mimeType });
    return URL.createObjectURL(blob);
}

async function extractOsk(file: Blob) {
    const reader = new zip.BlobReader(file);
    const extractor = new zip.ZipReader(reader);

    const skinElements: AssetsReference = [];

    await extractor.getEntries().then((entries) => {
        const promises = entries.map(async (entry) => {
            const fileName = entry.filename;
            const fileFormat = getFileExtension(fileName);
            const fileType = getFileType(fileName);
            const fileMime = mime.getType(fileFormat) ?? undefined;

            const blobWriter = new zip.BlobWriter();
            const data = await entry.getData?.(blobWriter);

            if (!data) return;

            const url = generateBlobURL(data, fileFormat);
            skinElements.push({
                name: fileName,
                url: url,
                mimeType: fileMime ?? "",
            });
        });

        return Promise.all(promises);
    });

    return skinElements;
}

async function extractOsz(file: Blob) {
    const reader = new zip.BlobReader(file);
    const extractor = new zip.ZipReader(reader);

    const assets: AssetsReference = [];

    await extractor.getEntries().then((entries) => {
        const promises = entries.map(async (entry) => {
            const fileName = entry.filename;
            const fileFormat = getFileExtension(fileName);
            const fileMime = mime.getType(fileFormat) ?? undefined;

            const blobWriter = new zip.BlobWriter();
            const data = await entry.getData?.(blobWriter);

            const metadata = {} as any;
            // If ends with .osu, it's a beatmap
            if (fileFormat === "osu") {
                const textData = (await data?.text()) ?? "";
                const diffName = textData
                    .match(/Version:.*/gi)?.[0]
                    .split(":")[1]
                    .trim();

                metadata.difficultyName = diffName;
            }

            if (!data) return;
            const url = generateBlobURL(data, fileFormat);
            assets.push({
                name: fileName,
                url: url,
                mimeType: fileMime ?? "",
                metadata: metadata,
            });
        });

        return Promise.all(promises);
    });

    return assets;
}

async function extractOsr(file: Blob) {
    const arrayBuffer = await file.arrayBuffer();
    const replay = await Replay.FromArrayBuffer(arrayBuffer);

    return replay;
}

export { extractOsk, extractOsz, extractOsr };
