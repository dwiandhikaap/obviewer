import Obviewer, { utils } from "./lib/obviewer";
import $ from "jquery";
import { wait } from "./util";

async function downloadReplay() {
    return await fetch(`/assets/test2/replay.osr`).then((map) => map.blob());
}

async function downloadBeatmap() {
    return await fetch(`/assets/test2/beatmap2.osz`).then((map) => map.blob());
}

async function downloadBeatmap2() {
    return await fetch(`/assets/test2/beatmap2.osz`).then((map) => map.blob());
}

async function downloadSkin() {
    return await fetch(`/assets/test2/skin.osk`).then((map) => map.blob());
}

function addListeners(obviewer: Obviewer) {
    $("#togglePause").on("click", () => {
        obviewer.isPaused ? obviewer.play() : obviewer.pause();
    });

    $("body").on("keypress", async function (e) {
        if (e.key === " ") {
            obviewer.isPaused ? obviewer.play() : obviewer.pause();
        }
    });

    $("#startTest").on("click", async function (e) {
        console.log("Downloading Skin");
        const skinBlob = await downloadSkin();

        console.log("Downloading Beatmap");
        const beatmapBlob = await downloadBeatmap();

        /*   console.log("Downloading Replay");
        const replay = await downloadReplay().then((map) => BlobReader.extractOsr(map)); */

        console.log("Extracting Skin");
        const skin = await utils.extractOsk(skinBlob);

        console.log("Extracting Beatmap");
        const beatmap = await utils.extractOsz(beatmapBlob);

        console.log("Loading Skin");
        obviewer.addSkin(skin);

        console.log("Loading Beatmap");
        obviewer.addBeatmap(beatmap);

        //console.log("Loading Replay");
        //obviewer.loadReplay(replay);

        await obviewer.loadBeatmap("Reol - No title (VINXIS) [Celsius' Extra].osu");
        obviewer.play();

        const resources = obviewer.checkResources();
        console.log(resources);
    });
}

async function main() {
    const skin = await downloadSkin();
    const obviewer = new Obviewer({
        container: "#main-canvas",
    });

    addListeners(obviewer);
}

await main();
