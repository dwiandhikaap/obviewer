class Difficulty {
    hpDrainRate: number;
    circleSize: number;
    overallDifficulty: number;
    approachRate: number;
    sliderMultiplier: number;
    sliderTickRate: number;

    parseStringArray(args: string[]) {
        // "key : value" String Format Parsing
        const [hpDrainRate, circleSize, overallDifficulty, approachRate, sliderMultiplier, sliderTickRate] = args.map(
            (row) => row.replace(/.+: */g, "")
        );

        this.hpDrainRate = parseFloat(hpDrainRate);
        this.circleSize = parseFloat(circleSize);
        this.overallDifficulty = parseFloat(overallDifficulty);
        this.approachRate = parseFloat(approachRate);
        this.sliderMultiplier = parseFloat(sliderMultiplier);
        this.sliderTickRate = parseFloat(sliderTickRate);
    }
}

export { Difficulty };
