import path from "path";
import fs from "fs";
import find from "find";
import sc from "../services/index.js";
import AudioEntity from "./entity/audioEntity.js";
import VideoEntity from "./entity/videoEntity.js";
import ppath from "./helpers/projectPath.js"
import pconfig from "./helpers/projectConfig.js";

export default class Project {
    static ALLOWED_TYPES = ['radio', 'interlude'];

    _name;
    _path;
    _config;
    _extensions;
    _directories;
    _outputUrl;

    constructor(projectName, rewritingURL = undefined) {
        this._name = projectName;
        this._outputUrl = rewritingURL;
    }

    async init() {
        this._path = await ppath(this.name);
        this._config = await pconfig(this.path);
        this._directories = this._getDirectories();
        this._extensions = this._getExtensions();
        this._outputUrl = this._getOutputUrl();
        return this;
    }

    // TODO: Remove replaying the same music or video=
    getRandomFile(entityKey, sceneType) {
        // Find all of our files with the extensions
        let allFiles = [];
        this.extensions.get(entityKey).forEach(extension => {
            allFiles = [...allFiles, ...find.fileSync(extension, this.directories.get(sceneType)[entityKey])];
        });

        // Return a random file
        return allFiles[Math.floor(Math.random() * allFiles.length)];
    }

    get path() {
        return this._path;
    }

    get config() {
        return this._config;
    }

    get extensions() {
        return this._extensions;
    }

    get directories() {
        return this._directories;
    }

    get outputUrl() {
        return this._outputUrl;
    }

    get name() {
        return this._name;
    }

    _getDirectories() {
        const dirs = new Map();
        for(let type of Project.ALLOWED_TYPES) {
            dirs.set(type, {
                [AudioEntity.KEY]: path.join(this.path, this.config[type].audio_directory),
                [VideoEntity.KEY]: path.join(this.path, this.config[type].video_directory),
            });
        }
        return dirs;
    }

    _getExtensions() {
        const extensions = new Map();
        extensions.set(AudioEntity.KEY, sc.config.stream.supportedExtensions[AudioEntity.KEY]);
        extensions.set(VideoEntity.KEY, sc.config.stream.supportedExtensions[VideoEntity.KEY]);
        return extensions;
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
            throw new Error(`Missing stream_url or stream_key in project "${this.projectPath}"/config.json !`)
        }

        return stream_url.replace('$stream_key', stream_key);
    }
}