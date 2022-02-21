import { Buffer } from "buffer";
import { Mods } from "../Mods/Mods";
import { ReplayData } from "./ReplayData";
import { ReplayNode } from "./ReplayNodes";

const lzma = require("../../lib/lzma/lzma_worker.js").LZMA;
const leb = require("leb");

const EPOCH = 621355968000000000;
class Replay {
    public gameMode = 0;
    public gameVersion = 0;
    public beatmapMD5 = "";
    public playerName = "";
    public replayMD5 = "";
    public number_300s = 0;
    public number_100s = 0;
    public number_50s = 0;
    public gekis = 0;
    public katus = 0;
    public misses = 0;
    public score = 0;
    public maxCombo = 0;
    public perfectCombo = 0;
    public mods = new Mods();
    public life_bar = "";
    public timestamp = new Date(0);
    public replayLength = 0;
    public replayData = new ReplayData("");
    public unknown = 0;

    async toBlob(): Promise<Blob> {
        const replayBytes = await write(this);
        const arrayBuffer = Uint8Array.from(replayBytes);
        return new Blob([arrayBuffer], {
            type: "application/x-osu-replay",
        });
    }

    public get replayNodes() {
        return this.replayData.nodes;
    }

    public set replayNodes(nodesArray: ReplayNode[]) {
        this.replayData.nodes = nodesArray;
    }
}

/* Parse Buffer to Replay Objcet */
function read(buff: Buffer) {
    let offset = 0x00;
    return new Promise<Replay>((resolve, reject) => {
        let replay = new Replay();

        try {
            replay.gameMode = readByte(buff);
            replay.gameVersion = readInteger(buff);
            replay.beatmapMD5 = readString(buff);
            replay.playerName = readString(buff);
            replay.replayMD5 = readString(buff);

            replay.number_300s = readShort(buff);
            replay.number_100s = readShort(buff);
            replay.number_50s = readShort(buff);

            replay.gekis = readShort(buff);
            replay.katus = readShort(buff);
            replay.misses = readShort(buff);

            replay.score = readInteger(buff);
            replay.maxCombo = readShort(buff);

            replay.perfectCombo = readByte(buff);

            replay.mods = new Mods(readInteger(buff));

            replay.life_bar = readString(buff);
            replay.timestamp = new Date(Number(readLong(buff) - BigInt(EPOCH)) / 10000);
            replay.replayLength = readInteger(buff);

            if (replay.replayLength != 0) {
                readCompressed(buff, replay.replayLength, (result: string, err: any) => {
                    //console.log("LZMA Read: ", result);
                    replay.replayData = new ReplayData(result);
                    replay.unknown = Number(readLong(buff));
                });
            }

            resolve(replay);
        } catch (err) {
            console.log(err);
            reject(new Replay());
        }
    });

    function readByte(buffer: Buffer) {
        offset++;
        return buffer.readInt8(offset - 1);
    }

    function readShort(buffer: Buffer) {
        offset += 2;
        return buffer.readUIntLE(offset - 2, 2);
    }

    function readInteger(buffer: Buffer) {
        offset += 4;
        return buffer.readInt32LE(offset - 4);
    }

    function readLong(buffer: Buffer) {
        offset += 8;
        return buffer.readBigUInt64LE(offset - 8);
    }

    function readString(buffer: Buffer) {
        if (buffer.readInt8(offset) == 0x0b) {
            offset++;
            let ulebString = leb.decodeUInt64(buffer.slice(offset, offset + 8));
            let strLength = ulebString.value;
            offset += strLength + ulebString.nextIndex;
            return buffer.slice(offset - strLength, offset).toString();
        } else {
            offset++;
            return "";
        }
    }

    function readCompressed(buffer: Buffer, length: number, callback: Function) {
        offset += length;
        return length != 0 ? lzma.decompress(buffer.slice(offset - length, offset), callback) : callback(null, null);
    }
}

/* Write Replay Object to Buffer */
function write(replay: Replay) {
    return new Promise<Buffer>((resolve, reject) => {
        try {
            let gameMode = Buffer.from([replay.gameMode]);
            let gameVersion = writeInteger(replay.gameVersion);
            let beatmapMD5 = writeString(replay.beatmapMD5);
            let playerName = writeString(replay.playerName);
            let replayMD5 = writeString(replay.replayMD5);

            let number_300s = writeShort(replay.number_300s || 0);
            let number_100s = writeShort(replay.number_100s || 0);
            let number_50s = writeShort(replay.number_50s || 0);

            let gekis = writeShort(replay.gekis || 0);
            let katus = writeShort(replay.katus || 0);
            let misses = writeShort(replay.misses || 0);

            let score = writeInteger(replay.score || 0);
            let maxCombo = writeShort(replay.maxCombo || 0);
            let perfectCombo = new Buffer([replay.perfectCombo] || [0x01]);

            let mods = writeInteger(replay.mods.numeric);
            let life_bar = writeString(replay.life_bar || "");

            let timestamp = writeLong((replay.timestamp || new Date()).getTime() * 10000 + EPOCH);

            /* let replayData = undefined;
            let replayLength = undefined;
            let unknown = undefined; */
            //console.log("LZMA Compress :", replay.replayData.toString());

            lzma.compress(replay.replayData.toString() || "", 1, (res: any, err: any) => {
                let replayData = Buffer.from(res);
                let replayLength = writeInteger(replayData.length);
                let unknown = writeLong(replay.unknown || 0);

                const finalResult = Buffer.concat([
                    gameMode,
                    gameVersion,
                    beatmapMD5,
                    playerName,
                    replayMD5,
                    number_300s,
                    number_100s,
                    number_50s,
                    gekis,
                    katus,
                    misses,
                    score,
                    maxCombo,
                    perfectCombo,
                    mods,
                    life_bar,
                    timestamp,
                    replayLength,
                    replayData,
                    unknown,
                ]);

                resolve(finalResult);
            });
        } catch (err) {
            console.log(err);
            reject(Buffer.from([0x00]));
        }
    });

    function writeString(text: String) {
        if (text.length > 0) {
            return Buffer.concat([Buffer.from([0x0b]), leb.encodeUInt32(text.length), Buffer.from(text)]);
        }
        return Buffer.from([0x00]);
    }

    function writeInteger(int: number) {
        let buffer = Buffer.alloc(4);
        buffer.writeInt32LE(int);
        return buffer;
    }

    function writeShort(short: number) {
        let buffer = Buffer.alloc(2);
        buffer.writeUIntLE(short, 0, 2);
        return buffer;
    }
    function writeLong(long: number) {
        let buffer = Buffer.alloc(8);
        buffer.writeBigUInt64LE(BigInt(long));
        return buffer;
    }
}

export { Replay, read, write };
