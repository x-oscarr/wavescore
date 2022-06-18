export default (renderConfig, videoKey, audioKey, streamDuration) => {
    const configFps = renderConfig.fps || '24';

    // Create our ouput options
    // Some defaults we don't want change
    // Good starting point: https://wiki.archlinux.org/index.php/Streaming_to_twitch.tv
    const outputOptions = [
        `-map [${videoKey}]`,
        `-map [${audioKey}]`,
        // Our fps from earlier
        `-r ${configFps}`,
        // Group of pictures, want to set to 2 seconds
        // https://trac.ffmpeg.org/wiki/EncodingForStreamingSites
        // https://www.addictivetips.com/ubuntu-linux-tips/stream-to-twitch-command-line-linux/
        // Best Explanation: https://superuser.com/questions/908280/what-is-the-correct-way-to-fix-keyframes-in-ffmpeg-for-dash
        `-g ${parseInt(configFps, 10) * 2}`,
        `-keyint_min ${configFps}`,
        // Stop audio once we hit the specified duration
        // https://trac.ffmpeg.org/wiki/EncodingForStreamingSites
        `-pix_fmt yuv420p`
    ];

    if(streamDuration) {
        outputOptions.push(`-t ${streamDuration}`);
    }

    if (renderConfig.video_width && renderConfig.video_height) {
        outputOptions.push(`-s ${renderConfig.video_width}x${renderConfig.video_height}`);
    } else {
        outputOptions.push(`-s 480x854`);
    }

    if (renderConfig.video_bit_rate) {
        outputOptions.push(`-b:v ${renderConfig.video_bit_rate}`);
        outputOptions.push(`-minrate ${renderConfig.video_bit_rate}`);
        outputOptions.push(`-maxrate ${renderConfig.video_bit_rate}`);
    }

    if (renderConfig.audio_bit_rate) {
        outputOptions.push(`-b:a ${renderConfig.audio_bit_rate}`);
    }

    if (renderConfig.audio_sample_rate) {
        outputOptions.push(`-ar ${renderConfig.audio_sample_rate}`);
    }

    // Set our audio codec, this can drastically affect performance
    if (renderConfig.audio_codec) {
        outputOptions.push(`-acodec ${renderConfig.audio_codec}`);
    } else {
        outputOptions.push(`-acodec aac`);
    }

    // Set our video codec, and encoder options
    // https://trac.ffmpeg.org/wiki/EncodingForStreamingSites
    if (renderConfig.video_codec) {
        outputOptions.push(`-vcodec ${renderConfig.video_codec}`);
    } else {
        outputOptions.push(`-vcodec libx264`);
    }
    if (renderConfig.preset) {
        outputOptions.push(`-preset ${renderConfig.preset}`);
    }
    if (renderConfig.bufsize) {
        outputOptions.push(`-bufsize ${renderConfig.bufsize}`);
    }
    if (renderConfig.crf) {
        outputOptions.push(`-crf ${renderConfig.crf}`);
    }
    if (renderConfig.threads) {
        outputOptions.push(`-threads ${renderConfig.threads}`);
    }

    return outputOptions;
}