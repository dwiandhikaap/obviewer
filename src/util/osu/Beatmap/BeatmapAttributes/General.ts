class General {
    audioFilename: string;
    audioLeadIn: number;
    previewTime: number;
    countdown: number;
    sampleSet: string;
    stackLeniency: number;
    mode: number;
    letterboxInBreaks: number;
    widescreenStoryboard: number;
    useSkinSprites: number;
    overlayPosition: string;
    skinPreference: string;
    epilepsyWarning: number;
    countdownOffset: number;
    sampleMatchPlaybackRate: number;

    parseStringArray(args: string[]) {
        // Parse "key : value" string format
        function findValueByKey(key: string) {
            const rowFound = args.find((row) => row.split(":")[0].toLowerCase() === key.toLowerCase());

            if (rowFound) {
                return rowFound.replace(/.+: */g, "");
            } else {
                return undefined;
            }
        }

        this.audioFilename = findValueByKey("audioFilename") || "";
        this.audioLeadIn = parseInt(findValueByKey("audioLeadIn")) || 0;
        this.previewTime = parseInt(findValueByKey("previewTime")) || -1;
        this.countdown = parseInt(findValueByKey("countdown")) || 1;
        this.sampleSet = findValueByKey("sampleSet") || "Normal";
        this.stackLeniency = parseFloat(findValueByKey("stackLeniency")) || 0.7;
        this.mode = parseInt(findValueByKey("mode")) || 0;
        this.letterboxInBreaks = parseInt(findValueByKey("letterboxInBreaks")) || 0;
        this.widescreenStoryboard = parseInt(findValueByKey("widescreenStoryboard")) || 0;
        this.useSkinSprites = parseInt(findValueByKey("useSkinSprites")) || 0;
        this.overlayPosition = findValueByKey("overlayPosition") || "NoChange";
        this.skinPreference = findValueByKey("skinPreference") || "";
        this.epilepsyWarning = parseInt(findValueByKey("epilepsyWarning")) || 0;
        this.countdownOffset = parseInt(findValueByKey("countdownOffset")) || 0;
        this.sampleMatchPlaybackRate = parseInt(findValueByKey("sampleMatchPlaybackRate")) || 0;
    }
}

export { General };
