import path from "path";
import VideoEntity from "./entity/videoEntity.js";
import AudioEntity from "./entity/audioEntity.js";
import render from "./render.js";
import isRunning from "is-running";

class Task {
    static STATUS_NOT_READY = 'created';
    static STATUS_PREPARING = 'preparing';
    static STATUS_READY = 'ready';
    static STATUS_RUNNING = 'running';
    static STATUS_FINISHED = 'finished';
    static STATUS_CANCELED = 'canceled';

    _id;
    _project;
    _type;
    _video;
    _audio;
    _status;
    _promiseState;
    _flow;

    constructor(project, typeKey = null, audioFile = null, videoFile = null) {
        this._project = project;
        this._type = typeKey || this._getTypeKey();
        this._status = Task.STATUS_NOT_READY;

        this.audio = new AudioEntity(
            this._project,
            audioFile || this._project.getRandomFile(AudioEntity.KEY, this.type)
        );
        this.video = new VideoEntity(
            this._project,
            videoFile || this._project.getRandomFile(VideoEntity.KEY, this.type)
        );

        this._generateId();
    }

    static prepare(props) {
        const {project, type, errorCallback, audioFile = null, videoFile = null} = props;

        const task = new this(project, type, audioFile, videoFile);
        return task.prepare(errorCallback);
    }

    async prepare(errorCallback) {
        this._status = Task.STATUS_PREPARING;
        return this.audio.init()
            .then(() => {
                return this.video.init(errorCallback);
            })
            .then(() => {
                this._status = Task.STATUS_READY
            });
    }

    // Start perform task
    async start(thread) {
        this._status = Task.STATUS_RUNNING;
        this._flow = render(this, thread);
    }

    // Destructuring extra data after finish
    async finish() {
        this._status = Task.STATUS_FINISHED;
        this._flow = undefined;
    }

    // Immediately break stream flow of this task
    async stop() {
        if(!this._flow) return;

        this._status = Task.STATUS_CANCELED;
        // Get our command, its pid, and kill it.
        const ffmpegCommand = await this._flow;
        const ffmpegCommandPid = ffmpegCommand.ffmpegProc.pid;
        ffmpegCommand.kill();
        this._flow = undefined;

        // Wait until the pid is no longer running
        await new Promise(resolve => {
            const waitForPidToBeKilled = () => {
                if (isRunning(ffmpegCommandPid)) {
                    setTimeout(() => {
                        waitForPidToBeKilled();
                    }, 250);
                } else {
                    resolve();
                }
            };

            waitForPidToBeKilled();
        });

        return true;
    }

    get audio() {
        return this._audio;
    }

    set audio(entity) {
        return this._audio = entity;
    }

    get video() {
        return this._video;
    }

    set video(entity) {
        return this._video = entity;
    }

    get type() {
        return this._type;
    }

    set type(typeKey) {
        return this._type = typeKey;
    }

    get project() {
        return this._project;
    }

    set project(project) {
        return this._project = project;
    }

    get status() {
        return this._status;
    }

    set status(status) {
        return this._status = status;
    }

    get id() {
        return this._id;
    }

    get promise() {
        return this._promiseState;
    }

    _generateId() {
        const timestamp = process.hrtime();
        this._id = `${timestamp[0]}:${timestamp[1]}:${path.basename(this.audio.path, path.extname(this.audio.path))}`;
    }

    _getTypeKey() {
        let typeKey = 'radio';
        if (this._project.config.interlude.enabled) {
            const randomNumber = Math.random();
            const frequency = parseFloat(this._project.config.interlude.frequency, 10);
            if (randomNumber <= frequency) {
                typeKey = 'interlude';
            }
        }

        return typeKey;
    };
}

export default Task;