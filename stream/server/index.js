import chalk from "chalk";
import isRunning from "is-running";
import stream from "./stream.js";

// Save our current path
let currentPath = undefined;

// Save a reference to our ffmpegCommand
let ffmpegCommandPromise = undefined;

// Killing ffmpeg throws an expected error,
// Thus we want to make sure we don't call our error callback if so
let shouldListenForFfmpegErrors = false;

// Create our callbacks for stream end and error
const errorCallback = (err, stdout, stderr) => {
  // Check if we should respond to the error
  if (shouldListenForFfmpegErrors) {
    console.log(chalk.red('ffmpeg stderr:'), '\n\n', stderr);
    console.log(chalk.red('ffmpeg stdout:'), '\n\n', stdout);
    console.log(chalk.red('ffmpeg err:'), '\n\n', err);
    console.log(`${chalk.red('ffmpeg encountered an error.')} 😨`);
    console.log(`Please see the stderror output above to fix the issue.`);

    // Exit everything
    process.exit(1);
  }
};

const endCallback = () => {
  // Simply start a new stream
  console.log('\n');
  moduleExports.start();
};

const getOutputUrl = (config) => {
  if(config.stream_outputs) {
    return config.stream_outputs;
  }

  if (!config.stream_url || !config.stream_key) {
    console.log(`${chalk.red('Missing stream_url or stream_key in your config.json !')} 😟`);
    console.log(chalk.red('Exiting...'));
    console.log('\n');
    process.exit(1);
  }

  let streamUrl = config.stream_url;
  streamUrl = streamUrl.replace('$stream_key', config.stream_key);
  return streamUrl;
}

const moduleExports = {
  start: async (sc, projectPath, config, outputLocation) => {
    console.log(`${chalk.green('Starting stream!')} 🛠️`);

    // Get stream output URL
    const streamUrl = outputLocation || getOutputUrl(config);
    console.log(`${chalk.magenta('Streaming to:')} ${streamUrl}`);

    // Listen for errors again
    shouldListenForFfmpegErrors = true;

    // Start the stream again
    ffmpegCommandPromise = stream(sc, projectPath, config, streamUrl, endCallback, errorCallback);
    await ffmpegCommandPromise;
  },

  stop: async () => {
    console.log(`${chalk.magenta('Stopping stream...')} ✋`);
    shouldListenForFfmpegErrors = false;

    if (ffmpegCommandPromise) {
      // Get our command, its pid, and kill it.
      const ffmpegCommand = await ffmpegCommandPromise;
      const ffmpegCommandPid = ffmpegCommand.ffmpegProc.pid;
      ffmpegCommand.kill();
      ffmpegCommandPromise = undefined;

      // Wait until the pid is no longer running
      await new Promise(resolve => {
        const waitForPidToBeKilled = () => {
          if (isRunning(ffmpegCommandPid)) {
            setTimeout(() => {
              waitForPidToBeKilled();
            }, 250);
          } else {
            resolve();
          }
        };
        waitForPidToBeKilled();
      });
    }

    console.log(`${chalk.red('Stream stopped!')} 😃`);
  },
  isRunning: () => {
    return shouldListenForFfmpegErrors;
  }
};

// Finally our exports
export default moduleExports;
