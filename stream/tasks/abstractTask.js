import isRunning from "is-running";
import sc from "../../services/index.js";

export default  class AbstractTask {
    static STATUS_NOT_READY = 'created';
    static STATUS_PREPARING = 'preparing';
    static STATUS_READY = 'ready';
    static STATUS_RUNNING = 'running';
    static STATUS_FINISHED = 'finished';
    static STATUS_CANCELED = 'canceled';

    _id;
    _project;
    _sceneKey;
    _status;
    _options;
    _renderFunc;
    _promiseState;
    _flow;

    constructor(project, sceneKey, options) {
        this._project = project;
        this._sceneKey = sceneKey;
        this._options = options;
        this._status = AbstractTask.STATUS_NOT_READY;

        this._generateId();
        sc.get('logger').debug('Task %s - Created', this.id);
    }

    async prepare(errorCallback) {
        this._status = AbstractTask.STATUS_READY;
    }

    // Start perform task
    async run(thread) {
        console.log(this._sceneKey);
        sc.get('logger').info('Task: %s - Playing', this.id);
        this._status = AbstractTask.STATUS_RUNNING;
        this._flow = this._renderFunc(this, thread);
    }

    async finish() {
        sc.get('logger').debug('Task: %s - Finished', this.id);
        this._status = AbstractTask.STATUS_FINISHED;
        this._bin();
    }

    // Immediately break stream flow of this task
    async kill() {
        if(!this._flow) return;

        // Get our command, its pid, and kill it.
        const ffmpegCommand = await this._flow;
        const ffmpegCommandPid = ffmpegCommand.ffmpegProc.pid;
        ffmpegCommand.kill();

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

        sc.get('logger').debug('Task: %s - Killed', this.id);
        this._status = AbstractTask.STATUS_CANCELED;
        this._bin();
        return true;
    }

    get project() {
        return this._project;
    }

    get status() {
        return this._status;
    }

    get sceneKey() {
        return this._sceneKey;
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
        this._id = `${timestamp[0]}:${timestamp[1]}`;
    }

    _bin() {
        this._flow = undefined;
        this._renderFunc = undefined;
        this._promiseState = undefined;
        this._project = undefined;
    }
}