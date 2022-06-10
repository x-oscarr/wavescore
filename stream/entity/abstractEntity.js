import find from "find";
import pathModule from "path";

class AbstractEntity {
    _project;
    _path;

    constructor(project, filePath) {
        if (new.target === AbstractEntity) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this._project = project;
        this._path = filePath;
    }

    get path() {
        return this._path;
    }

    set path(filePath) {
        return this._path = filePath;
        // const isAllowed = this.entityExtensions.find(regex => regex.test(pathModule.extname(filePath)));
        // if(isAllowed) {
        //     return this._path = filePath;
        // }
        //
        // throw new Error(`File "${filePath}" does not match allowed extension`);
    }
}

export default AbstractEntity;