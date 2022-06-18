import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import {path as ffmpegPath} from "@ffmpeg-installer/ffmpeg";
import upath from "upath";
import progress from "cli-progress";
import chalk from "chalk";
import getOverlayTextString from "../helpers/overlayText.js";
import outputOptionsFunc from "./outputOptions.js";

export default async (task, thread) => {
    const path = task.project.path;
    const optimizedVideo = task.video.path;
    const randomSong = task.audio.path;
    const config = task.project.config;
    const overlayConfig = task.project.config.scenes[task.sceneKey].overlay;
    const metadata = task.audio.metadata;
    const outputLocation = task.project.outputUrl;

    // Create a new command
    let ffmpegCommand = ffmpeg()
        .setFfmpegPath(config.render.ffmpeg_path || ffmpegPath);

    // Add the video input
    ffmpegCommand = ffmpegCommand.input(optimizedVideo).inputOptions([
        // Loop the video infinitely
        `-stream_loop -1`
    ]);

    // Add our audio as input
    ffmpegCommand = ffmpegCommand.input(randomSong).audioCodec('copy');

    // Add a silent input
    // This is useful for setting the stream -re
    // pace, as well as not causing any weird bugs where we only have a video
    // And no audio output
    // https://trac.ffmpeg.org/wiki/Null#anullsrc
    ffmpegCommand = ffmpegCommand
        .input('anullsrc')
        .audioCodec('copy')
        .inputOptions([
            // Indicate we are a virtual input
            `-f lavfi`,
            // Livestream, encode in realtime as audio comes in
            // https://superuser.com/questions/508560/ffmpeg-stream-a-file-with-original-playing-rate
            // Need the -re here as video can drastically reduce input speed, and input audio has delay
            `-re`
        ]);

    // Start creating our complex filter for overlaying things
    let complexFilterString = '';

    // Add silence in front of song to prevent / help with stream cutoff
    // Since audio is stereo, we have two channels
    // https://ffmpeg.org/ffmpeg-filters.html#adelay
    // In milliseconds
    const delayInMilli = 3000;
    complexFilterString += `[1:a] adelay=${delayInMilli}|${delayInMilli} [delayedaudio]; `;

    // Mix our silent and song audio, se we always have an audio stream
    // https://ffmpeg.org/ffmpeg-filters.html#amix
    complexFilterString += `[delayedaudio][2:a] amix=inputs=2:duration=first:dropout_transition=3 [audiooutput]; `;

    // Check if we want normalized audio
    if (config.render.normalize_audio) {
        // Use the loudnorm filter
        // http://ffmpeg.org/ffmpeg-filters.html#loudnorm
        complexFilterString += `[audiooutput] loudnorm [audiooutput]; `;
    }

    // Okay this some weirdness. Involving fps.
    // So since we are realtime encoding to get the video to stream
    // At an apporpriate rate, this means that we encode a certain number of frames to match this
    // Now, let's say we have a 60fps input video, and want to output 24 fps. This is fine and work
    // FFMPEG will output at ~24 fps (little more or less), and video will run at correct rate.
    // But if you noticed the output "Current FPS" will slowly degrade to either the input
    // our output fps. Therefore if we had an input video at lest say 8 fps, it will slowly
    // Degrade to 8 fps, and then we start buffering. Thus we need to use a filter to force
    // The input video to be converted to the output fps to get the correct speed at which frames are rendered
    let configFps = config.render.video_fps || '24'

    complexFilterString += `[0:v] fps=fps=${configFps}`;

    // Add our overlay image
    // This works by getting the initial filter chain applied to the first
    // input, aka [0:v], and giving it a label, [videowithtext].
    // Then using the overlay filter to combine the first input, with the video of
    // a second input, aka [1:v], which in this case is our image.
    // Lastly using scale2ref filter to ensure the image size is consistent on all
    // videos. And scaled the image to the video, preserving video quality
    if (
        overlayConfig &&
        overlayConfig.enabled &&
        overlayConfig.image &&
        overlayConfig.image.enabled
    ) {
        // Add our image input
        const imageObject = overlayConfig.image;
        const imagePath = upath.join(path, imageObject.image_path);
        ffmpegCommand = ffmpegCommand.input(imagePath);
        complexFilterString +=
            ` [inputvideo];` +
            `[3:v][inputvideo] scale2ref [scaledoverlayimage][scaledvideo];` +
            // Notice the overlay shortest =1, this is required to stop the video from looping infinitely
            `[scaledvideo][scaledoverlayimage] overlay=x=${imageObject.position_x}:y=${imageObject.position_y}`;
    }

    // Add our overlayText
    const overlayTextFilterString = await getOverlayTextString(path, config, overlayConfig, metadata);
    if (overlayTextFilterString) {
        if (complexFilterString.length > 0) {
            complexFilterString += `, `;
        }
        complexFilterString += `${overlayTextFilterString}`;
    }

    // Set our final output video pad
    complexFilterString += ` [videooutput]`;

    // Apply our complext filter
    ffmpegCommand = ffmpegCommand.complexFilter(complexFilterString);

    // Let's create a nice progress bar
    // Using the song length as the 100%, as that is when the stream should end
    const songTotalDuration = Math.floor(metadata.duration);
    const progressBar = new progress.Bar(
        {
            format: 'Audio Progress {bar} {percentage}% | Time Playing: {duration_formatted} |'
        },
        progress.Presets.shades_classic
    );

    // Set our event handlers
    let ffpmepgCommand = ffmpegCommand
        .on('start', commandString => {
            console.log(' ');
            console.log(`${chalk.blue('Spawned Ffmpeg with command:')}`);
            console.log(commandString);
            console.log(' ');

            // Start our progress bar
            progressBar.start(songTotalDuration, 0);
        })
        .on('end', () => {
            progressBar.stop();
            if (thread._endCallback) {
                thread._endCallback();
            }
        })
        .on('error', (err, stdout, stderr) => {
            progressBar.stop();

            if (thread._errorCallback) {
                thread._errorCallback(err, stdout, stderr);
            }
        })
        .on('progress', progress => {
            // Get our timestamp
            const timestamp = progress.timemark.substring(0, 8);
            const splitTimestamp = timestamp.split(':');
            const seconds = parseInt(splitTimestamp[0], 10) * 60 * 60 + parseInt(splitTimestamp[1], 10) * 60 + parseInt(splitTimestamp[2], 10);

            // Set seconds onto progressBar
            progressBar.update(seconds);
        });

    // Get our stream duration
    // This is done instead of using the -shortest flag
    // Because of a bug where -shortest can't be used with complex audio filter
    // https://trac.ffmpeg.org/ticket/3789
    // This will give us our song duration, plus some beginning and ending padding
    const delayInSeconds = Math.ceil(delayInMilli / 1000);
    const streamDuration = delayInSeconds * 2 + Math.ceil(metadata.duration);

    // Create our ouput options
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