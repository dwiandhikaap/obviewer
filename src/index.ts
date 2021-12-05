import * as $ from "jQuery";
import { Maps } from "./util/osu/Beatmap/Beatmap";
import { Mod } from "./util/osu/Replay/Mods";
import { Replay } from "./util/osu/Replay/Replay";
import { Keypress, ReplayNode } from "./util/osu/Replay/ReplayNodes";
import { ReplayUtility } from "./util/osu/Replay/ReplayUtility";

let replay = new Replay();

$("input#replayFile:file").on("change", function () {
    let reader = new FileReader();
    reader.onload = async function () {
        let arrayBuffer = this.result as ArrayBuffer;
        let parser = new ReplayUtility();
        replay = await parser.parseFromBytes(arrayBuffer);
    };

    console.log(typeof $(this).prop("files"));
    reader.readAsArrayBuffer($(this).prop("files")[0]);
});

$("input#mapsFile:file").on("change", function () {
    let reader = new FileReader();
    reader.onload = async function () {
        let resultString = this.result as string;
        //console.log(resultString);
        const map = new Maps(resultString);

        console.log(map.hitObjects.getHitObjectByTime(31060));
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
    parser.saveReplayFile(replay, "pog.osr");
});

function rand(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}
