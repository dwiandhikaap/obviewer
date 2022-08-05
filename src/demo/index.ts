import { Obviewer, utils } from "../lib/app";
import $ from "jquery";
import { AssetsReference } from "../lib/util";

function createDiffSelection(maps: AssetsReference, obviewer: Obviewer) {
    const diffSelector = $(`<select id="diff-selector">`);
    diffSelector.empty();
    diffSelector.append(`<option value="" disabled="disabled" selected="selected">Select Difficulty</option>`);
    for (const [index, map] of maps.entries()) {
        const diff = map.metadata.difficultyName;
        const diffOption = $(`<option value="${index}">${diff}</option>`);
        diffSelector.append(diffOption);
    }

    $(".load-difficulty").empty();
    $(".load-difficulty").append(diffSelector);
    diffSelector.on("change", function () {
        const index = parseInt($(this).val() as string);
        const map = maps[index];
        obviewer.load(map.name);
        obviewer.play();
    });
}

async function downloadBeatmapAssets(url: string, onProgress?: (progress: number) => void) {
    const response = await fetch(url);

    const reader = response.body!.getReader();
    const contentLength = +response.headers.get("Content-Length")!;

    const chunks: ArrayBuffer[] = [];
    let bytesRead = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        chunks.push(value);
        bytesRead += value.byteLength;
        if (onProgress) {
            onProgress(bytesRead / contentLength);
        }
    }
    const blob = new Blob(chunks);
    return utils.extractOsz(blob);
}

async function downloadSkin() {
    return await fetch(`/assets/test2/skin5.osk`)
        .then((map) => map.blob())
        .then((blob) => utils.extractOsk(blob));
}

function parseBeatmapPageURL(url: string) {
    // Use direct link if there's any
    if (url.endsWith(".osz")) {
        return url;
    }

    // Use 3rd party site for external download
    if (!isNaN(+url)) {
        return `https://api.chimu.moe/v1/download/${url}`;
    }

    let match = url.match(/(osu.ppy.sh\/beatmapsets\/\d+)/g);
    if (match && match.length > 0) {
        const id = match[0].match(/(\d+)/g);
        return `https://api.chimu.moe/v1/download/${id}`;
    }

    return null;
}

function addListeners(obviewer: Obviewer) {
    $("#selection-load-button").on("click", async () => {
        const url = $("#selection-url-input").val() as string;

        const downloadURI = parseBeatmapPageURL(url);
        if (!downloadURI) return;

        $(".load-progress-bg").removeClass("hidden");
        const beatmapAssets = await downloadBeatmapAssets(downloadURI, (progress) => {
            $("#load-progress-bar").css("width", `${progress * 100}%`);
            $("#load-progress-bar").text(`${Math.floor(progress * 100)}%`);
        });
        const skinAssets = await downloadSkin();

        obviewer.addBeatmap(beatmapAssets);
        obviewer.addSkin(skinAssets);

        const maps = beatmapAssets.filter((asset) => asset.metadata.difficultyName !== undefined);

        createDiffSelection(maps, obviewer);
        $(".load-progress-bg").addClass("hidden");
    });

    $("body").on("keypress", async function (e) {
        if (e.key === " ") {
            obviewer.isPaused ? obviewer.play() : obviewer.pause();
        }
    });
}

async function main() {
    const obviewer = new Obviewer({
        container: "#main-canvas",
    });

    addListeners(obviewer);
}

(async function () {
    await main();
})();
