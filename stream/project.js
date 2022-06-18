import path from "path";
import fs from "fs";
import {getJsFile, getJsonFile} from "../libs/import.js";
import ppath from "./helpers/projectPath.js"

export default class Project {
    _name;
    _path;
    _config;
    _outputUrl;

    constructor(projectName, rewritingURL = undefined) {
        this._name = projectName;
        this._outputUrl = rewritingURL;
    }

    async init() {
        this._path = await ppath(this.name);
        this._config = await this._getConfig();
        this._outputUrl = this._getOutputUrl();
        return this;
    }

    get path() {
        return this._path;
    }

    get config() {
        return this._config;
    }

    get outputUrl() {
        return this._outputUrl;
    }

    get name() {
        return this._name;
    }

    _getOutputUrl() {
        if(this._outputUrl) {
            return this._outputUrl;
        }

        const {stream_outputs, stream_url, stream_key} = this.config;

        if(stream_outputs) {
            return stream_outputs;
        }

        if (!stream_url || !stream_key) {
            throw new Error(`Missing stream_url or stream_key in project "${this.path}"/config.json !`)
        }

        return stream_url.replace('$stream_key', stream_key);
    }

    async _getConfig() {
        const configJsonPath = path.join(this.path, 'config.json')
        const configJsPath = path.join(this.path, 'config.js')

        if (fs.existsSync(configJsonPath)) {
            return getJsonFile(configJsonPath)
        } else if (fs.existsSync(configJsPath)) {
            return await getJsFile(configJsPath)
        } else {
            throw new Error(`Error did not find a config.json at: ${configJsonPath} 😞`);
        }
    }
}