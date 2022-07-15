export const getFileExtension = (filename: string) => {
    return filename.split(".").pop() || "";
};

export const omitFileExtension = (filename: string) => {
    return filename.split(".").slice(0, -1).join(".") || filename;
};

export const compareNameOnly = (a: string, b: string) => {
    return omitFileExtension(a) === omitFileExtension(b);
};

export type FileType = "audio" | "image" | "video" | "unknown";

export function getFileType(fileName: string): FileType {
    const fileExt = getFileExtension(fileName);
    return getExtensionType(fileExt);
}

export function getExtensionType(extension: string): FileType {
    const audioFormats = ["mp3", "wav", "ogg", "mpga"];
    const imageFormats = ["png", "jpg", "jpeg", "gif", "bmp", "webp"];
    const videoFormats = ["mp4", "webm", "mkv", "mpeg", "avi"];

    if (audioFormats.includes(extension)) {
        return "audio";
    } else if (imageFormats.includes(extension)) {
        return "image";
    } else if (videoFormats.includes(extension)) {
        return "video";
    }

    return "unknown";
}
