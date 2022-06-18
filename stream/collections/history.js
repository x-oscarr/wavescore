import AbstractTask from "../tasks/abstractTask.js";

export default class History {
    _list;
    _limit;

    constructor(limit = 100) {
        this._list = [];
        this._limit = limit;
    }

    add(task) {
        if(!task instanceof AbstractTask) {
            throw new Error('Wrong task instance');
        }
        this._list.slice(0, 100).unshift(task);
    }

    get list() {
        return this._list;
    }
}