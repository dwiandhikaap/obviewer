import { Howl } from "howler";
import mimelite from "mime/lite";
import { LoaderResource } from "pixi.js";
import { getExtensionType } from "../util/filename";
import { AudioHandler } from "./AudioHandler";

export function audioMiddleware(audioHandler: AudioHandler) {
    return async function _audioMiddleware(resource: LoaderResource, next: (...args: any[]) => void) {
        let { mimeType } = resource.metadata;
        if (mimeType) {
            if (Array.isArray(mimeType)) {
                mimeType = mimeType[0];
            }

            const extension = mimelite.getExtension(mimeType) ?? "";
            const fileType = getExtensionType(extension);

            if (fileType === "audio") {
                const audio = await new Promise<Howl>((resolve) => {
                    const howl = new Howl({
                        src: resource.url,
                        format: ["mp3", "wv", "mpga", "ogg"],
                        onload: () => {
                            resolve(howl);
                        },
                        onloaderror: () => {
                            resolve(howl);
                        },
                    });
                });

                resource.data = audio;
                audioHandler.add(resource.name, audio);
            }
        }

        next();
    };
}
