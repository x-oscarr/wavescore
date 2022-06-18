class AbstractEntity {
    _project;
    _path;

    constructor(project, filePath) {
        this._project = project;
        if (new.target === AbstractEntity) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this._path = filePath;
    }

    get path() {
        return this._path;
    }

    set path(filePath) {
        return this._path = filePath;
    }
}

export default AbstractEntity;