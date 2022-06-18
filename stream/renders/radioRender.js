import ffmpeg from "fluent-ffmpeg";
import {path as ffmpegPath} from "@ffmpeg-installer/ffmpeg";
import upath from "upath";

export default class RadioRender {

    _ffmpeg;
    _task;

    constructor(task, thread) {
        this._task = task;

        this._ffmpeg = ffmpeg().setFfmpegPath(this._task.project.config.render.ffmpeg_path || ffmpegPath);

        this._setInputs();
    }

    _setInputs() {
        // Add the video input
        this._ffmpeg.input(this._task.video).inputOptions([
            // Loop the video infinitely
            `-stream_loop -1`
        ]);

        // Add our audio as input
        this._ffmpeg.input(this._task.audio)
            .audioCodec('copy');

        // Add a silent input
        // This is useful for setting the stream -re
        // pace, as well as not causing any weird bugs where we only have a video
        // And no audio output
        // https://trac.ffmpeg.org/wiki/Null#anullsrc
        this._ffmpeg.input('anullsrc')
            .audioCodec('copy')
            .inputOptions([
                // Indicate we are a virtual input
                `-f lavfi`,
                // Livestream, encode in realtime as audio comes in
                // https://superuser.com/questions/508560/ffmpeg-stream-a-file-with-original-playing-rate
                // Need the -re here as video can drastically reduce input speed, and input audio has delay
                `-re`
            ]);
    }

    _addFilters() {
        const configFps = this._task.project.config.render.video_fps || '24'
        const delayInMilli = 3000;
        const filters = [
            // Add silence in front of song to prevent / help with stream cutoff
            // Since audio is stereo, we have two channels
            // https://ffmpeg.org/ffmpeg-filters.html#adelay
            // In milliseconds
            `[1:a] adelay=${delayInMilli}|${delayInMilli} [delayedaudio]`

            // Mix our silent and song audio, se we always have an audio stream
            // https://ffmpeg.org/ffmpeg-filters.html#amix
            `[delayedaudio][2:a] amix=inputs=2:duration=first:dropout_transition=3 [audiooutput]`,

            // So since we are realtime encoding to get the video to stream
            // At an appropriate rate, this means that we encode a certain number of frames to match this
            // Now, let's say we have a 60fps input video, and want to output 24 fps. This is fine and work
            // FFMPEG will output at ~24 fps (little more or less), and video will run at correct rate.
            // But if you noticed the output "Current FPS" will slowly degrade to either the input
            // our output fps. Therefore if we had an input video at lest say 8 fps, it will slowly
            // Degrade to 8 fps, and then we start buffering. Thus we need to use a filter to force
            // The input video to be converted to the output fps to get the correct speed at which frames are rendered
            `[0:v] fps=fps=${configFps}[inputvideo]`,
        ];

        if(this._config.render.normalize_audio) {
            // Use the loudnorm filter
            // http://ffmpeg.org/ffmpeg-filters.html#loudnorm
            filters.push(`[audiooutput] loudnorm [audiooutput]`)
        }

        if(this._task.project.config.overlay?.enabled && this._task.project.config.overlay?.image?.enabled) {
            // Adding overlay image
            filters.push(this._addOverlayImage())
        }

        this._ffmpeg.complexFilter(filters);
    }

    _addOverlayImage() {
        // Add our image input
        const imageObject = this._task.project.config.overlay.image;
        const imagePath = upath.join(this._task.project.path, imageObject.image_path);
        this._ffmpeg.input(imagePath);
        return [
            `[3:v][inputvideo] scale2ref [scaledoverlayimage][scaledvideo]`,
            // Notice the overlay shortest =1, this is required to stop the video from looping infinitely
            `[scaledvideo][scaledoverlayimage] overlay=x=${imageObject.position_x}:y=${imageObject.position_y}[videooutput]`,
        ];
    }
}