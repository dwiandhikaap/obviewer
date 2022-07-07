import * as $ from "jQuery";
import ReplayTale, { Beatmap, Replay, Mod, Mods, ReplayData, ReplayNode, Settings } from "./lib/obviewer/obviewer";

let replay: Replay;

const replaytale = new ReplayTale({
    container: "#main-canvas",
});

$("input#replayFile:file").on("change", function () {
    let reader = new FileReader();
    reader.onload = async function () {
        let arrayBuffer = this.result as ArrayBuffer;
        replay = await Replay.FromArrayBuffer(arrayBuffer);
        //console.log(replay);
    };

    reader.readAsArrayBuffer($(this).prop("files")[0]);
});

let direction = 1;

$("input#mapsFile:file").on("change", async function () {
    let reader = new FileReader();
    reader.onload = async function () {
        let resultString = this.result as string;
        const map = new Beatmap(resultString);
        //(map);

        return map;
    };

    const files = $(this).prop("files");

    let audioFileName: string = "";
    let backgroundFile: string = "";

    let audioFile: HTMLAudioElement | undefined = undefined;
    let backgroundImage: HTMLImageElement | undefined = undefined;
    let beatmap: Beatmap | undefined = undefined;

    for (const file of files) {
        if (file.name.endsWith(".osu")) {
            const text = await file.text();
            beatmap = new Beatmap(text);
            //console.log(beatmap);

            audioFileName = beatmap.getAudioFilename();
            backgroundFile = beatmap.getBackgroundFileNames()[0];

            break;
        }
    }

    for (const file of files) {
        if (file.name === audioFileName) {
            const audioFileBuffer = await file.arrayBuffer();
            const audioFileBlob = new Blob([audioFileBuffer], {
                type: "audio/mp3",
            });
            const audioFileUrl = URL.createObjectURL(audioFileBlob);

            // create audio file
            audioFile = new Audio(audioFileUrl);
        } else if (file.name === backgroundFile) {
            const backgroundFileBuffer = await file.arrayBuffer();
            const fileExt = backgroundFile.split(".").pop();
            const backgroundFileBlob = new Blob([backgroundFileBuffer], {
                type: `image/${fileExt}`,
            });
            const backgroundFileUrl = URL.createObjectURL(backgroundFileBlob);

            // create background image
            backgroundImage = new Image();
            backgroundImage.src = backgroundFileUrl;

            const backgroundImageLoaded = new Promise((resolve) => {
                backgroundImage!.onload = resolve;
            });

            await backgroundImageLoaded;
        }
    }

    console.log(replay);

    replaytale.loadReplay(replay);
    replaytale.loadBeatmapAssets(audioFile, backgroundImage);
    beatmap && replaytale.loadBeatmap(beatmap);
    if (replay === undefined) {
        throw new Error("replay is undefined");
    }
    replaytale.playbackRate = 1;
    replaytale.play();
});

$("body").on("keypress", async function (e) {
    // check spacebar
    if (e.key === " ") {
        if (replaytale.isPaused) {
            replaytale.play();
        } else {
            replaytale.pause();
        }
    }
});

async function saveReplayFile(replay: Replay, fileName: string) {
    const blob = await replay.toBlob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    link.remove();
}

$("button#replay-download").on("click", async function () {
    //console.log(replay.replayData);
    //console.log(replay.mods.list);

    //const replayNode = new ReplayNode(0, 300, 100, 100, 15);
    //const clickNodes = replay.replayData.filter((node) => node.isPressing("M1"));
    await download();
});

async function download() {
    /* const startIndex = replay.replayData.getIndexNear(1000);
    const endIndex = replay.replayData.getIndexNear(8000);
    const nodes = replay.replayData;
    for (let i = startIndex; i < endIndex; i++) {
        const node = nodes[i];
        node.removeKeypress(Keypress.K1);
        node.removeKeypress(Keypress.K2);
        node.removeKeypress(Keypress.M1);
        node.removeKeypress(Keypress.M2);
    }

    replay.replayData.forEach((node) => node.translate(rand(-15, 15), rand(-15, 15))); */
    const blob = await replay.toBlob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "asdasd.osr";
    link.click();
    link.remove();
}

// temporary testing lol
$("button#startTest").on("click", async function (e) {
    e.preventDefault();
    this.style.backgroundColor = "lightgreen";

    this.textContent = "Parsing Replay...";

    const replayBuffer = await fetch(`/dist/assets/test/replay.osr`).then((ah) => ah.arrayBuffer());
    replay = await Replay.FromArrayBuffer(replayBuffer);

    this.textContent = "Parsing Beatmap...";

    const music = new Audio("/dist/assets/test/audio.mp3");
    const map = await fetch(`/dist/assets/test/map.osu`).then((ah) => ah.text());

    const mapBeatmap = new Beatmap(map);

    this.textContent = "Loading Image...";

    const background = new Image();
    background.src = `/dist/assets/test/bg.jpg`;

    const backgroundImageLoaded = new Promise((resolve) => {
        background!.onload = resolve;
    });

    await backgroundImageLoaded;

    try {
        if (replay && mapBeatmap && music) {
            this.textContent = "Loading Replay";
            //console.log(replay);

            replaytale.loadReplay(replay);

            this.textContent = "Loading Beatmap";

            replaytale.loadBeatmapAssets(music, background);
            replaytale.loadBeatmap(mapBeatmap);
            //console.log(mapBeatmap.difficulty.mods.contains([Mod.HardRock, Mod.Hidden]));

            this.textContent = "Starting Replay";
            const mods = new Mods();

            //mods.enable(Mod.HardRock);
            // mods.enable(Mod.Hidden);
            mods.enable(Mod.Hidden);
            console.log("Contains Hidden : ", mods.contains(Mod.Hidden));
            mods.disable(Mod.Hidden);
            console.log("Contains Hidden : ", mods.contains(Mod.Hidden));
            mods.enable(Mod.Hidden);

            console.log("Contains Hidden : ", mods.contains(Mod.Hidden));

            console.log(replay);

            const speed = 0.3;

            replaytale.enableModsOverride(mods);
            replaytale.disableModsOverride();
            replaytale.playbackRate = speed;
            Settings.set("AudioVolume", 10);
            //Settings.set("AudioOffset", 0);
            replaytale.seek(5000);
            replaytale.play();

            const waitTime = 3000 / speed;
            const seekTime = 120000;

            /* await wait(waitTime);
            replaytale.seek(seekTime);
            await wait(waitTime);
            replaytale.seek(seekTime);
            await wait(waitTime);
            replaytale.seek(seekTime);
            await wait(waitTime);
            replaytale.seek(seekTime);
            await wait(waitTime);
            replaytale.seek(seekTime); */

            /* await wait(3000);
            // replaytale.enableModsOverride(new Mods(Mod.HardRock));
            await wait(3000);
            //replaytale.disableModsOverride();
            replaytale.enableModsOverride(new Mods(Mod.Hidden));
            await wait(3000);
            replaytale.disableModsOverride();
            // replaytale.enableModsOverride(new Mods(Mod.Easy));
            await wait(3000);
            replaytale.enableModsOverride(new Mods(Mod.HardRock));
            await wait(3000);
            replaytale.disableModsOverride();
            await wait(3000);
            replaytale.enableModsOverride(new Mods(Mod.None));
            await wait(3000);
            replaytale.enableModsOverride(new Mods(Mod.Easy));
            await wait(3000);
            replaytale.enableModsOverride(new Mods(Mod.HardRock));
            await wait(3000);
            replaytale.enableModsOverride(new Mods(Mod.None));
            await wait(3000);
            replaytale.disableModsOverride(); */
        } else {
            this.textContent = "Failed Loading Game";

            //console.log(replay, mapBeatmap, music);
        }
    } catch (error) {
        this.textContent = error as string;
        console.error(error);
    }
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