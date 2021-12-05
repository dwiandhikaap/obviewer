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
    }
}

export { Colours };
