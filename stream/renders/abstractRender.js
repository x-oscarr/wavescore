import outputOptionsFunc from "./outputOptions";

export default class AbstractRender {
    _task;
    _thread;

    constructor() {

    }

    setInput(file, options = []) {
        this._inputs = {file, options};
    }

    init() {
        // Create our output options
        // Some defaults we don't want change
        // Good starting point: https://wiki.archlinux.org/index.php/Streaming_to_twitch.tv
        const outputOptions = outputOptionsFunc(
            config.render,
            'videooutput',
            'audiooutput',
            streamDuration
        );

        // Finally, save the stream to our stream URL
        let singleOutputLocation = '';
        if (Array.isArray(outputLocation)) {
            singleOutputLocation = outputLocation[0];
        } else {
            singleOutputLocation = outputLocation;
        }

        // Add our output options for the stream
        ffmpegCommand = ffmpegCommand.outputOptions([
            ...outputOptions,
            // Set format to flv (Youtube/Twitch)
            `-f flv`
        ]);

        ffmpegCommand = ffmpegCommand.save(singleOutputLocation);

        return ffmpegCommand;
    }
}