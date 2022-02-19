const DEFAULT_COLOURS = [
    [141, 174, 240],
    [115, 129, 241],
    [214, 214, 214],
    [160, 160, 160],
];

class Colours {
    combo: number[][] = [];
    sliderTrackOverride: number[];
    sliderBorder: number[];

    // "key : value" String Format Parsing
    parseStringArray(colourStringArray: string[]) {
        for (let colourString of colourStringArray) {
            if (colourString.includes("SliderTrackOverride")) {
                this.sliderTrackOverride = colourString.replace(/.+: */g, "").split(",").map(Number);
            } else if (colourString.includes("SliderBorder")) {
                this.sliderBorder = colourString.replace(/.+: */g, "").split(",").map(Number);
            } else {
                this.combo.push(colourString.replace(/.+: */g, "").split(",").map(Number));
            }
        }

        if (this.combo.length === 0) {
            this.combo = DEFAULT_COLOURS;
        }
    }

    get hex() {
        return this.combo.map((colour) => `#${colour.map((c) => c.toString(16).padStart(2, "0")).join("")}`);
    }
}

export { Colours };
