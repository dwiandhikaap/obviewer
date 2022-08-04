import { Obviewer, Mod, Mods, utils } from "../lib/app";
import $ from "jquery";
import { wait } from "../lib/util";

async function downloadReplay() {
    return await fetch(`/assets/test2/siveroo - Aitsuki Nakuru & Kabocha - Lilith [Vigor] (2022-07-15) Osu.osr`).then((map) =>
        map.blob()
    );
}

async function downloadBeatmap() {
    return await fetch(`/assets/test2/1261931 Aitsuki Nakuru & Kabocha - Lilith.osz`).then((map) => map.blob());
}

async function downloadBeatmap2() {
    return await fetch(`/assets/test2/beatmap2.osz`).then((map) => map.blob());
}

async function downloadSkin() {
    return await fetch(`/assets/test2/skin5.osk`).then((map) => map.blob());
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

        console.log("Downloading Replay");
        const replay = await downloadReplay().then((map) => utils.extractOsr(map));

        console.log("Extracting Skin");
        const skin = await utils.extractOsk(skinBlob);

        console.log("Extracting Beatmap");
        const beatmap = await utils.extractOsz(beatmapBlob);

        console.log("Loading Skin");
        obviewer.addSkin(skin);

        console.log("Loading Beatmap");
        obviewer.addBeatmap(beatmap);
        //obviewer.disableModsOverride();

        const mods = new Mods();
        mods.enable(Mod.HalfTime);
        obviewer.enableModsOverride(mods);
        await obviewer.load("Aitsuki Nakuru & Kabocha - Lilith (Celine) [Vigor].osu", replay);

        obviewer.play();
        obviewer.seek(74000);
        obviewer.checkResources();

        await wait(1000);
        obviewer.seek(120000);
    });
}

async function main() {
    const skin = await downloadSkin();
    const obviewer = new Obviewer({
        container: "#main-canvas",
    });

    addListeners(obviewer);
}

(async function () {
    await main();
})();
