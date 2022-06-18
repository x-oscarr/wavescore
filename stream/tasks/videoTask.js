import AbstractTask from "./abstractTask.js";
import sc from "../../services/index.js";
import videoRender from "../renders/video.js";

export default class VideoTask extends AbstractTask {
    _video;

    constructor(project, sceneKey, options, entities) {
        super(project, sceneKey, options);
        this._video = entities.video;
        this._renderFunc = videoRender;
    }

    async prepare(errorCallback) {
        sc.get('logger').debug('Task %s - Preparing', this.id);
        this._status = AbstractTask.STATUS_PREPARING;
        return this.video.init(errorCallback).then(() => {
            sc.get('logger').debug('Task %s - Ready to run', this.id);
            this._status = AbstractTask.STATUS_READY;
        });
    }

    get video() {
        return this._video;
    }
}