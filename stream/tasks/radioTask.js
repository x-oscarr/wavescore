import AbstractTask from "./abstractTask.js";
import sc from "../../services/index.js";
import radioRender from "../renders/radio.js";

export default class RadioTask extends AbstractTask {
    _video;
    _audio;

    constructor(project, sceneKey, options, entities) {
        super(project, sceneKey, options);
        this._video = entities.video;
        this._audio = entities.audio;
        this._renderFunc = radioRender;
    }

    async prepare(errorCallback) {
        sc.get('logger').debug('Task %s - Preparing', this.id);
        this._status = AbstractTask.STATUS_PREPARING;
        return this.audio.init()
            .then(() => {
                return this.video.init(errorCallback);
            })
            .then(() => {
                sc.get('logger').debug('Task %s - Ready to run', this.id);
                this._status = AbstractTask.STATUS_READY;
            });
    }

    get audio() {
        return this._audio;
    }

    get video() {
        return this._video;
    }
}