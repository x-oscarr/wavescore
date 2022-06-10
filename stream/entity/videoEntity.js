import pathModule from "path";
import getOptimizedGif from "../helpers/optimizedGif.js";
import AbstractEntity from "./abstractEntity.js";

class VideoEntity extends AbstractEntity {
    static KEY = 'video';
    _originalPath;

    constructor(project, filePath) {
        super(project, filePath);
        this.originalPath = this.path;
    }

    async init(errorCallback) {
        await this.optimize(errorCallback);
    }

    async optimize(errorCallback) {
        if (pathModule.extname(this.originalPath) === '.gif') {
            this.path = await getOptimizedGif(this.path, this._project.config, errorCallback);
        }
    }

    get originalPath() {
        return this._originalPath;
    }

    set originalPath(path) {
        return this._originalPath = path;
    }
}

export default VideoEntity;