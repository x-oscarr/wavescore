import chalk from "chalk";
import isRunning from "is-running";
import Task from "./task.js";
import History from "./collections/history.js";
import Queue from "./collections/queue.js";

class Thread {
  _project;
  _history;
  _queue;
  _flow;
  _activeTask;
  _isSkipping;

  constructor(project) {
    this._project = project;
    this._history = new History(this.project.config.api.number_of_history_items)
    this._queue = new Queue();
    this._flow = undefined;
    this._isSkipping = false;
  }

  async run () {
    this._activeTask = this.queue.pull(this._errorCallback) || new Task(this.project);

    switch (this.activeTask.status) {
      case Task.STATUS_NOT_READY:
        await this.activeTask.prepare(this._errorCallback);
        break;
      case Task.STATUS_PREPARING:
        await this.activeTask.promise;
        break;
    }

    if(this.queue.isEmpty) {
      this.queue.add(new Task(this.project));
    }

    this.activeTask.start(this);
    this.queue.preRender(this._errorCallback);
  }

  async skip() {
    this._isSkipping = true;
    this.activeTask.stop()
    this.run();
  }

  async stop() {
    this.activeTask.finish();
  }

  get activeTask() {
    return this._activeTask;
  }

  get project() {
    return this._project;
  }

  get queue() {
    return this._queue;
  }

  get history() {
    return this._history;
  }

  _errorCallback(err, stdout, stderr) {
    if(this._isSkipping) {
      this._isSkipping = false;
      return;
    }

    // Check if we should respond to the error
    console.log(chalk.red('ffmpeg stderr:'), '\n\n', stderr);
    console.log(chalk.red('ffmpeg stdout:'), '\n\n', stdout);
    console.log(chalk.red('ffmpeg err:'), '\n\n', err);
    console.log(`${chalk.red('ffmpeg encountered an error.')} 😨`);
    console.log(`Please see the stderror output above to fix the issue.`);

    // Exit everything
    process.exit(1);

  }

  _endCallback() {
    this.activeTask.finish();
    this.run();
  }
}

export default Thread;