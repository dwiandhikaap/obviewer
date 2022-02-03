import * as $ from "jQuery";
import { Beatmap } from "./osu/Beatmap/Beatmap";
import { Mod } from "./osu/Replay/Mods";
import { Replay } from "./osu/Replay/Replay";
import { ReplayNode } from "./osu/Replay/ReplayNodes";
import { ReplayUtility } from "./osu/Replay/ReplayUtility";
import { Redos } from "./Redos/Redos";

let replay = new Replay();

const redraw = new Redos({
    container: "#main-canvas",
});

$("input#replayFile:file").on("change", function () {
    let reader = new FileReader();
    reader.onload = async function () {
        let arrayBuffer = this.result as ArrayBuffer;
        let parser = new ReplayUtility();
        replay = await parser.parseFromBytes(arrayBuffer);
        console.log(replay);
    };

    console.log(typeof $(this).prop("files"));
    reader.readAsArrayBuffer($(this).prop("files")[0]);
});

let direction = 1;

$("input#mapsFile:file").on("change", function () {
    let reader = new FileReader();
    reader.onload = async function () {
        let resultString = this.result as string;
        const map = new Beatmap(resultString);
        console.log(map);

        redraw.loadBeatmap(map);

        /* redraw.timestamp = 130000;
        setInterval(() => {
            redraw.timestamp += direction * 50;
            if (redraw.timestamp >= 2000) {
                direction = -1;
            }
            if (redraw.timestamp <= 100) {
                direction = 1;
            }
        }, 50); */
        redraw.unpause();
        await wait();
        redraw.pause();
        await wait(2000);
        redraw.seek(10000);
    };

    //console.log(typeof $(this).prop("files"));
    reader.readAsText($(this).prop("files")[0]);
});

$("button#replay-download").on("click", async function () {
    const parser = new ReplayUtility();
    console.log(replay.replayData);
    console.log(replay.mods.list);

    const replayNode = new ReplayNode(300, 100, 100, 15);
    replay.playerName = "siveroo??!";
    replay.mods.enable(Mod.NoFail);
    //replay.mods.enable(Mod.Relax);
    replay.mods.enable(Mod.DoubleTime);

    replay.replayNodes.forEach((node) => node.translate(rand(-15, 15), rand(-15, 15)));
    //parser.saveReplayFile(replay, "pog.osr");
});

function rand(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function wait(time: number = 1000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("adsasd");
        }, time);
    });
}
