class Editor {
    bookmarks: number[];
    distanceSpacing: number;
    beatDivisor: number;
    gridSize: number;
    timelineZoom: number;

    parseStringArray(args: string[]) {
        // "key : value" String Format Parsing
        const [bookmarks, distanceSpacing, beatDivisor, gridSize, timelineZoom] = args.map((row) =>
            row.replace(/.+: */g, "")
        );
        this.bookmarks = bookmarks.split(",").map(Number);
        this.distanceSpacing = parseFloat(distanceSpacing);
        this.beatDivisor = parseInt(beatDivisor);
        this.gridSize = parseInt(gridSize);
        this.timelineZoom = parseFloat(timelineZoom);
    }
}

export { Editor };
