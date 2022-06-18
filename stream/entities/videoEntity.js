import pathModule from "path";
import ffmpeg from "fluent-ffmpeg";
import {path as ffprobePath} from "@ffprobe-installer/ffprobe";
import getOptimizedGif from "../helpers/optimizedGif.js";
import AbstractEntity from "./abstractEntity.js";

class VideoEntity extends AbstractEntity {
    static KEY = 'video';

    _metadata
    _originalPath;

    constructor(project, filePath) {
        super(project, filePath);
        this.originalPath = this.path;
    }

    async init(errorCallback) {
        await this.optimize(errorCallback);
        await this.fetchMetadata();
    }

    async optimize(errorCallback) {
        if (pathModule.extname(this.originalPath) === '.gif') {
            this.path = await getOptimizedGif(this.path, this._project.config, errorCallback);
        }
    }

    async fetchMetadata() {
        const rawMetadata = await new Promise((resolve, reject) =>
            ffmpeg(this.path)
                .setFfprobePath(ffprobePath)
                .ffprobe((err, rawMetadata) => {
                    err && reject(err);
                    resolve(rawMetadata);
                })
        );

        return this._metadata = {
            filename: pathModule.basename(this.path),
            duration: rawMetadata.format.duration,
            title: rawMetadata.format.title,
            year: rawMetadata.format.year,
        };
    }

    get originalPath() {
        return this._originalPath;
    }

    set originalPath(path) {
        return this._originalPath = path;
    }

    get metadata() {
        return this._metadata;
    }
}

export default VideoEntity;