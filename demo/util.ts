import * as zip from "@zip.js/zip.js";
import { Beatmap, Replay } from "./lib/obviewer";

export function rand(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export async function wait(time: number = 1000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("adsasd");
        }, time);
    });
}
