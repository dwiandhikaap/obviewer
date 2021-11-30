import { Buffer } from "buffer";

const lzma = require("../lib/lzma/lzma_worker.js").LZMA;
const leb = require("leb");

const EPOCH = 621355968000000000;

class Replay {
    gameMode = 0;
    gameVersion = 0;
    beatmapMD5 = "";
    playerName = "";
    replayMD5 = "";
    number_300s = 0;
    number_100s = 0;
    number_50s = 0;
    gekis = 0;
    katus = 0;
    misses = 0;
    score = 0;
    max_combo = 0;
    perfect_combo = 0;
    mods = 0;
    life_bar = "";
    timestamp = new Date(0);
    replay_length = 0;
    replay_data = "";
    unknown = 0;

    async toBlob(): Promise<Blob> {
        const replayBytes = await write(this);
        const arrayBuffer = Uint8Array.from(replayBytes);
        return new Blob([arrayBuffer], {
            type: "application/octet-stream",
        });
    }
}

/* Parse Buffer to Replay Objcet */
function read(buff: Buffer) {
    let offset = 0x00;
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
        replay.max_combo = readShort(buff);

        replay.perfect_combo = readByte(buff);

        replay.mods = readInteger(buff);

        replay.life_bar = readString(buff);
        replay.timestamp = new Date(
            Number(readLong(buff) - BigInt(EPOCH)) / 10000
        );
        replay.replay_length = readInteger(buff);

        if (replay.replay_length != 0) {
            readCompressed(buff, replay.replay_length, (res: any, err: any) => {
                replay.replay_data = res;
                replay.unknown = Number(readLong(buff));
            });
        }

        return replay;
    } catch (err) {
        console.log(err);
    }

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

    function readCompressed(
        buffer: Buffer,
        length: number,
        callback: Function
    ) {
        offset += length;
        return length != 0
            ? lzma.decompress(buffer.slice(offset - length, offset), callback)
            : callback(null, null);
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
            let max_combo = writeShort(replay.max_combo || 0);
            let perfect_combo = new Buffer([replay.perfect_combo] || [0x01]);

            let mods = writeInteger(replay.mods);
            let life_bar = writeString(replay.life_bar || "");

            let timestamp = writeLong(
                (replay.timestamp || new Date()).getTime() * 10000 + EPOCH
            );

            /* let replay_data = undefined;
            let replay_length = undefined;
            let unknown = undefined; */
            lzma.compress(replay.replay_data || "", 1, (res: any, err: any) => {
                let replay_data = Buffer.from(res);
                let replay_length = writeInteger(replay_data.length);
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
                    max_combo,
                    perfect_combo,
                    mods,
                    life_bar,
                    timestamp,
                    replay_length,
                    replay_data,
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
            return Buffer.concat([
                Buffer.from([0x0b]),
                leb.encodeUInt32(text.length),
                Buffer.from(text),
            ]);
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
