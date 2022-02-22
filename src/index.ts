import * as $ from "jQuery";
import { Logger } from "./logger/Logger";
import { Beatmap } from "./osu/Beatmap/Beatmap";
import { Mod } from "./osu/Mods/Mods";
import { Replay, ReplayNode } from "./osu/Replay/Replay";
import { ReplayTale } from "./ReplayTale/ReplayTale";

let replay = new Replay();

const replaytale = new ReplayTale({
    container: "#main-canvas",
});

$("input#replayFile:file").on("change", function () {
    let reader = new FileReader();
    reader.onload = async function () {
        let arrayBuffer = this.result as ArrayBuffer;
        replay = await Replay.FromArrayBuffer(arrayBuffer);
        console.log(replay);
    };

    reader.readAsArrayBuffer($(this).prop("files")[0]);
});

let direction = 1;

$("input#mapsFile:file").on("change", async function () {
    let reader = new FileReader();
    reader.onload = async function () {
        let resultString = this.result as string;
        const map = new Beatmap(resultString);
        console.log(map);

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
            console.log(beatmap);

            audioFileName = beatmap.getAudioFilename();
            backgroundFile = beatmap.getBackgroundFileNames()[0];

            break;
        }
    }

    for (const file of files) {
        if (file.name === audioFileName) {
            const audioFileBuffer = await file.arrayBuffer();
            const audioFileBlob = new Blob([audioFileBuffer], { type: "audio/mp3" });
            const audioFileUrl = URL.createObjectURL(audioFileBlob);

            // create audio file
            audioFile = new Audio(audioFileUrl);
        } else if (file.name === backgroundFile) {
            const backgroundFileBuffer = await file.arrayBuffer();
            const fileExt = backgroundFile.split(".").pop();
            const backgroundFileBlob = new Blob([backgroundFileBuffer], { type: `image/${fileExt}` });
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

    beatmap && replaytale.loadBeatmap(beatmap, audioFile, backgroundImage);
    if (replay === undefined) {
        throw new Error("replay is undefined");
    }
    replaytale.loadReplay(replay);
    //replaytale.seek(0);
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

$("button#replay-download").on("click", async function () {
    console.log(replay.replayData);
    console.log(replay.mods.list);

    const replayNode = new ReplayNode(0, 300, 100, 100, 15);
    replay.playerName = "siveroo??!";
    replay.mods.enable(Mod.NoFail);
    //replay.mods.enable(Mod.Relax);
    replay.mods.enable(Mod.DoubleTime);

    //replay.replayData.forEach((node) => node.translate(rand(-15, 15), rand(-15, 15)));
    //parser.saveReplayFile(replay, "pog.osr");
});

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
            console.log(replay);

            replaytale.loadReplay(replay);

            this.textContent = "Loading Beatmap";

            replaytale.loadBeatmap(mapBeatmap, music, background);

            this.textContent = "Starting Replay";
            replaytale.playbackRate = 1;
            replaytale.play();
        } else {
            this.textContent = "Failed Loading Game";

            console.log(replay, mapBeatmap, music);
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

const logger = Logger.view;
const loggerContainer = document.getElementById("logger") as HTMLDivElement;
loggerContainer.appendChild(logger);
