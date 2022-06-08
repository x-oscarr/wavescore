import fs from "fs";
import path from "path";
import chalk from "chalk";

const getJsConfig = async (configPath) => {
    try {
        return (await import(configPath)).default;
    } catch (e) {
        throw new Error(`${chalk.red('error calling the config.js!')} 😞`);
    }
}

const getJsonConfig = (configPath) => {
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
        throw new Error(`${chalk.red('error reading the config.json!')} 😞`);
    }
}

export default async (projectPath) => {
    const configJsonPath = path.join(projectPath, 'config.json')
    const configJsPath = path.join(projectPath, 'config.js')

    if (fs.existsSync(configJsonPath)) {
        return getJsonConfig(configJsonPath)
    } else if (fs.existsSync(configJsPath)) {
        return getJsConfig(configJsPath)
    } else {
        throw new Error(`${chalk.red('Error did not find a config.json at:')} ${configJsonPath} 😞\n`);
    }
}