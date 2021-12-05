class Metadata {
    title: string;
    titleUnicode: string;
    artist: string;
    artistUnicode: string;
    creator: string;
    version: string;
    source: string;
    tags: string;
    beatmapId: number;
    beatmapSetId: number;

    parseStringArray(args: string[]) {
        // "key : value" String Format Parsing
        const [title, titleUnicode, artist, artistUnicode, creator, version, source, tags, beatmapId, beatmapSetId] =
            args.map((row) => row.replace(/.+: */g, ""));

        this.title = title || "";
        this.titleUnicode = titleUnicode || "";
        this.artist = artist || "";
        this.artistUnicode = artistUnicode || "";
        this.creator = creator || "";
        this.version = version || "";
        this.source = source || "";
        this.tags = tags || "";
        this.beatmapId = parseInt(beatmapId) || 0;
        this.beatmapSetId = parseInt(beatmapSetId) || 0;
    }
}

export { Metadata };
