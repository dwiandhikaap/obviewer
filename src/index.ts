import { Replay, ReplayManipulator } from "./util/osu/ReplayManipulator";
import * as $ from "jQuery";

let replay = new Replay();

$("input:file").on("change", function () {
    let reader = new FileReader();
    reader.onload = async function () {
        let arrayBuffer = this.result as ArrayBuffer;
        let parser = new ReplayManipulator();
        replay = await parser.parseFromBytes(arrayBuffer);
    };

    console.log(typeof $(this).prop("files"));
    reader.readAsArrayBuffer($(this).prop("files")[0]);
});

$("button#replay-download").on("click", async function () {
    const parser = new ReplayManipulator();
    console.log(replay.getReplayData());
    console.log(replay.getMods());

    //    parser.saveReplayFile(replay, "pog.osr");
});
