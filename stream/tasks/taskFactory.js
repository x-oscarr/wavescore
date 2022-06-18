import find from "find";
import path from "path";
import sc from "../../services/index.js"
import randSceneType from "../helpers/randSceneType.js";
import RadioTask from "./radioTask.js";
import VideoTask from "./videoTask.js";
import AudioEntity from "../entities/audioEntity.js";
import VideoEntity from "../entities/videoEntity.js";

export default class TaskFactory {
    static RENDER_RADIO = 'radio';
    static RENDER_VIDEO = 'video';
    static RENDER_TYPES = {
        [TaskFactory.RENDER_RADIO]: RadioTask,
        [TaskFactory.RENDER_VIDEO]: VideoTask,
    }

    _project;
    _dirs;
    _extensions;

    constructor(project) {
        this._project = project;
        this._extensions = this._getExtensions()
        this._dirs = this._getDirectories()
    }

    createTask(sceneKey = null, entities = {}, options = {}) {
        sceneKey = sceneKey || this._getRandomSceneKey();
        const sceneConfig = this._getSceneConfig(sceneKey);
        const renderType = sceneConfig.render_type;

        if(!TaskFactory.RENDER_TYPES.hasOwnProperty(renderType)) {
            throw new Error(`Incorrect render type "${renderType}" in scene "${sceneKey}"`);
        }

        const entitiesPull = {};
        switch (renderType) {
            case TaskFactory.RENDER_RADIO:
                entitiesPull.video = entities.video || new VideoEntity(
                    this._project,
                    this._getRandomFile(VideoEntity.KEY, sceneKey)
                );
                entitiesPull.audio = entities.audio || new AudioEntity(
                    this._project,
                    this._getRandomFile(AudioEntity.KEY, sceneKey)
                );
                break;
            case TaskFactory.RENDER_VIDEO:
                entitiesPull.video = entities.video || new VideoEntity(
                    this._project,
                    this._getRandomFile(VideoEntity.KEY, sceneKey)
                );
                break;
        }
        return new TaskFactory.RENDER_TYPES[renderType](this._project, sceneKey, options, entitiesPull);
    }

    // TODO: Remove replaying the same music or video=
    _getRandomFile(entityKey, sceneKey) {
        // Find all of our files with the extensions
        let allFiles = [];
        this._extensions.get(entityKey).forEach(extension => {
            allFiles = [...allFiles, ...find.fileSync(extension, this._dirs.get(sceneKey)[entityKey])];
        });

        // Return a random file
        return allFiles[Math.floor(Math.random() * allFiles.length)];
    }

    _getRandomSceneKey() {
        return randSceneType(this._project.config.scenes);
    };

    _getSceneConfig(sceneKey) {
        return this._project.config.scenes[sceneKey];
    }

    _getDirectories() {
        const dirs = new Map();
        const scenes = this._project.config.scenes;

        for(let sceneKey in scenes) {
            if(!scenes.hasOwnProperty(sceneKey)) continue;

            let audioDir = scenes[sceneKey].audio_directory;
            let videoDir = scenes[sceneKey].video_directory;

            let dirsPull = {};
            if(audioDir) dirsPull[AudioEntity.KEY] = path.join(this._project.path, audioDir);
            if(videoDir) dirsPull[VideoEntity.KEY] = path.join(this._project.path, videoDir);

            dirs.set(sceneKey, dirsPull);
        }
        return dirs;
    }

    _getExtensions() {
        const extensions = new Map();
        extensions.set(AudioEntity.KEY, sc.config.stream.supportedExtensions[AudioEntity.KEY]);
        extensions.set(VideoEntity.KEY, sc.config.stream.supportedExtensions[VideoEntity.KEY]);
        return extensions;
    }
}