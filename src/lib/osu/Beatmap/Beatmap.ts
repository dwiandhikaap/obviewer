import { Mods } from "../Mods/Mods";
import { Colours } from "./BeatmapAttributes/Colours";
import { Difficulty } from "./BeatmapAttributes/Difficulty";
import { Editor } from "./BeatmapAttributes/Editor";
import { BackgroundEvent, Events, VideoEvent } from "./BeatmapAttributes/Events";
import { General } from "./BeatmapAttributes/General";
import { HitObjects } from "./BeatmapAttributes/HitObjects";
import { Metadata } from "./BeatmapAttributes/Metadata";
import { TimingPoints } from "./BeatmapAttributes/TimingPoints";

class Beatmap {
    general: General;
    editor: Editor;
    metadata: Metadata;
    difficulty: Difficulty;
    events: Events;
    timingPoints: TimingPoints;
    colours: Colours;
    hitObjects: HitObjects;

    constructor(private mapData: string = "", mods?: Mods) {
        const { general, editor, metadata, difficulty, events, timingPoints, colours, hitObjects } = this.parseBeatmap(mods);
        this.general = general;
        this.editor = editor;
        this.metadata = metadata;
        this.difficulty = difficulty;
        this.events = events;
        this.timingPoints = timingPoints;
        this.colours = colours;
        this.hitObjects = hitObjects;
    }

    private parseBeatmap(mods?: Mods) {
        const general = new General();
        const editor = new Editor();
        const metadata = new Metadata();
        const difficulty = new Difficulty();
        const events = new Events();
        const timingPoints = new TimingPoints();
        const colours = new Colours();
        const hitObjects = new HitObjects();

        // Split the map data into lines
        const row = this.mapData
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
        general.parseStringArray(sectionChunk[0]);
        editor.parseStringArray(sectionChunk[1]);
        metadata.parseStringArray(sectionChunk[2]);
        difficulty.parseStringArray(sectionChunk[3], mods);
        events.parseStringArray(sectionChunk[4]);
        timingPoints.parseStringArray(sectionChunk[5]);
        colours.parseStringArray(sectionChunk[6]);
        hitObjects.parseStringArray(sectionChunk[7], difficulty, timingPoints);

        // Set hitObjects colours and stacks
        const hexColours = colours.hex;
        hitObjects.applyColour(hexColours);

        const stackLeniency = general.stackLeniency;
        hitObjects.applyStacking(difficulty, stackLeniency);

        return { general, editor, metadata, difficulty, events, timingPoints, colours, hitObjects };
    }

    getMods() {
        return this.difficulty.mods;
    }

    setMods(mods: Mods) {
        const { general, editor, metadata, difficulty, events, timingPoints, colours, hitObjects } = this.parseBeatmap(mods);

        this.difficulty = difficulty;
        this.hitObjects = hitObjects;
    }

    getBackgroundFileNames(): string[] {
        const backgroundNames: string[] = [];
        this.events.events.forEach((event) => {
            if (event.eventType === "background") {
                backgroundNames.push((event as BackgroundEvent).filename);
            }
        });
        return backgroundNames;
    }

    getAudioFilename(): string {
        return this.general.audioFilename;
    }

    // TODO: include storyboards assets
    // TODO: add more information to assets deps, like audio type ("hitsound", "song", etc), etc
    getAssetsFilename(): string[] {
        const assets: string[] = [];

        // General - Audio
        assets.push(this.general.audioFilename);

        // Beatmap custom hitsample - Audio
        const customHitSamples = this.hitObjects.objects
            .filter((hitObject) => hitObject.hitSample?.filename)
            .map((hitObject) => hitObject.hitSample!.filename);
        assets.push(...customHitSamples);

        // Events (without storyboard)
        this.events.events.forEach((event) => {
            if (event.eventType === "background") {
                assets.push((event as BackgroundEvent).filename);
            } else if (event.eventType === "video") {
                assets.push((event as VideoEvent).filename);
            }
        });

        return assets;
    }
}

export { Beatmap };
