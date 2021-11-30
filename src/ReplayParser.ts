import { Buffer } from "buffer";
import { read, Replay, write } from "./util/osr-parser";

class ReplayParser {
    parseFromBytes(_buffer: ArrayBuffer) {
        const buffer = toBuffer(_buffer);
        const result = read(buffer);
        console.log(result);

        return result;
    }

    async writeToBytes(replay: Replay) {
        const result = await write(replay);
        console.log(result);
        return result;
    }

    async saveReplayFile(replay: Replay, fileName: string) {
        const blob = await replay.toBlob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        link.remove();
    }
}

function toBuffer(ab: ArrayBuffer) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

export { ReplayParser, Replay };
