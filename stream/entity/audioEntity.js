import pathModule from "path";
import musicMetadata from "music-metadata";
import AbstractEntity from "./abstractEntity.js";

class AudioEntity extends AbstractEntity {
    static KEY = 'audio';



    constructor(project, filePath) {
        super(project, filePath);
    }

    async init() {
        await this.fetchMetadata();
    }

    async fetchMetadata() {
        const metadata = await musicMetadata.parseFile(this.path, { duration: true });
        return this.metadata = metadata;
    }


}

export default AudioEntity;