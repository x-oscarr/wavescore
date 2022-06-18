import pathModule from "path";
import musicMetadata from "music-metadata";
import AbstractEntity from "./abstractEntity.js";

class AudioEntity extends AbstractEntity {
    static KEY = 'audio';

    _metadata;

    constructor(project, filePath) {
        super(project, filePath);
    }

    async init() {
        await this.fetchMetadata();
    }

    async fetchMetadata() {
        const rawMetadata = await musicMetadata.parseFile(this.path, { duration: true });
        this._metadata = {
            filename: pathModule.basename(this.path),
            duration: rawMetadata.format.duration,
            year: rawMetadata.common.year,
            title: rawMetadata.common.title,
            album: rawMetadata.common.album,
            artist: rawMetadata.common.artist,
            coverPath: rawMetadata.common.picture
        };
        return this._metadata;
    }

    get metadata() {
        return this._metadata;
    }
}

export default AudioEntity;