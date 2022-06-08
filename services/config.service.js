import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import chalk from "chalk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const configDir = path.join(__dirname,'../configs');
const include = async (filename) => {
    if(path.extname(filename) === '.json') {
        return JSON.parse(fs.readFileSync(path.join(configDir, filename), 'utf8'));
    }
    return (await import(path.join(configDir, filename))).default;
}

export default async () => {
    return {
        stream: await include('stream.config.js'),
    };
}

