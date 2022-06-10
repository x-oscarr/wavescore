import Task from "../task.js";

export default class Queue {
    _list;

    constructor() {
        this._list = [];
    }

    add(task) {
        if(!task instanceof Task) {
            throw new Error('Wrong task instance');
        }
        this._list.unshift(task);
    }

    pull() {
        return this._list.pop();
    }

    preRender(thread) {
        const next = this._list[this._list.length - 1];
        next && next.status === Task.STATUS_NOT_READY && next.prepare(thread);
    }

    isEmpty() {
        return !!this._list;
    }
}