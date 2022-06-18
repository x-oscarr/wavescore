import chalk from "chalk";
import History from "./collections/history.js";
import Queue from "./collections/queue.js";
import TaskFactory from "./tasks/taskFactory.js";
import AbstractTask from "./tasks/abstractTask.js";

class Thread {
  _project;
  _factory;
  _history;
  _queue;
  _flow;
  _activeTask;
  _silent;

  constructor(project) {
    this._project = project;
    this._factory = new TaskFactory(project);
    this._history = new History(this.project.config.api.number_of_history_items)
    this._queue = new Queue();
    this._flow = undefined;
  }

  async start () {
    this._silent = false;
    this._activeTask = this.queue.pull(this._errorCallback) || this._factory.createTask();

    switch (this.activeTask.status) {
      case AbstractTask.STATUS_NOT_READY:
        await this.activeTask.prepare(this._errorCallback);
        break;
      case AbstractTask.STATUS_PREPARING:
        await this.activeTask.promise;
        break;
    }

    if(this.queue.isEmpty) {
      this.queue.add(this._factory.createTask());
    }

    this.activeTask.run(this);
    this.queue.preRender(this._errorCallback);
  }

  async next() {
    this._silent = true;
    this.activeTask.kill();
    this.start();
  }

  async stop() {
    this._silent = true;
    this.activeTask.kill();
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
    if(this._silent) return

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
    this.start();
  }
}

export default Thread;