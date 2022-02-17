import { Colours } from "./BeatmapAttributes/Colours";
import { Difficulty } from "./BeatmapAttributes/Difficulty";
import { Editor } from "./BeatmapAttributes/Editor";
import { Events } from "./BeatmapAttributes/Events";
import { General } from "./BeatmapAttributes/General";
import { HitObjects } from "./BeatmapAttributes/HitObjects";
import { Metadata } from "./BeatmapAttributes/Metadata";
import { TimingPoints } from "./BeatmapAttributes/TimingPoints";

class Beatmap {
    general = new General();
    editor = new Editor();
    metadata = new Metadata();
    difficulty = new Difficulty();
    events = new Events();
    timingPoints = new TimingPoints();
    colours = new Colours();
    hitObjects = new HitObjects();

    constructor(mapData: string) {
        // Split the map data into lines
        const row = mapData
            .replace(/(\/\/.+)/g, "")
            .split(/\r?\n/)
            .filter((str) => str !== "");

        // Get section headers index/row
        const sections = [
            "[General]",
            "[Editor]",
            "[Metadata]",
            "[Difficulty]",
            "[Events]",
            "[TimingPoints]",
            "[Colours]",
            "[HitObjects]",
        ];
        const sectionsIndex = sections.map((section) => row.findIndex((str) => str === section));

        // Split sections into their own array, and remove the section headers
        const sectionChunk: string[][] = [];
        sectionsIndex.reverse().forEach((index) => {
            sectionChunk.push(row.splice(index).splice(1));
        });
        sectionChunk.reverse();

        // Parse sections into their own objects
        this.general.parseStringArray(sectionChunk[0]);
        this.editor.parseStringArray(sectionChunk[1]);
        this.metadata.parseStringArray(sectionChunk[2]);
        this.difficulty.parseStringArray(sectionChunk[3]);
        this.events.parseStringArray(sectionChunk[4]);
        this.timingPoints.parseStringArray(sectionChunk[5]);
        this.colours.parseStringArray(sectionChunk[6]);
        this.hitObjects.parseStringArray(sectionChunk[7], this.difficulty, this.timingPoints);

        // Set hitObjects colours and stacks
        const hexColours = this.colours.hex;
        this.hitObjects.applyColour(hexColours);

        const stackLeniency = this.general.stackLeniency;
        this.hitObjects.applyStacking(this.difficulty, stackLeniency);
    }
}

export { Beatmap };
