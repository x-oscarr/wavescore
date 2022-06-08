import { readFileSync } from "fs";
import { program } from "commander";
import start from "./stream/start.js";
import create from "./stream/create/index.js";

const cli = async () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    program
        // .name(packageJson.name)
        .version(packageJson.version)
        .description(packageJson.description);

    program
        .command('start')
        .description('Start the stream using the passed directory')
        .argument('[project]', 'Name or path to project folder')
        .option('-o, --output [stream output location]', 'Override the "stream_url/stream_key" parameters')
        .option('--no-web', 'Start the stream without web server')
        .action(await start)

    program
        .command('create')
        .description('Create a new stream project')
        .argument('<project>', 'Name or path to project folder')
        .action(create);

    program.parse();
}

await cli();