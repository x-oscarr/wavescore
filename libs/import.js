import {readFileSync, existsSync} from "fs";

export const getJsFile = async (configPath) => {
    try {
        return (await import(configPath)).default;
    } catch (e) {
        throw new Error(`error calling the ${configPath}`);
    }
}

export const getJsonFile = (configPath) => {
    try {
        return JSON.parse(readFileSync(configPath, 'utf8'));
    } catch (e) {
        throw new Error(`error reading the ${configPath}`);
    }
}

export const include = async (pathToFile) => {
    if (existsSync(pathToFile)) {
        return getJsonFile(pathToFile)
    } else if (existsSync(pathToFile)) {
        return await getJsFile(pathToFile)
    } else {
        throw new Error(`Error did not find ${pathToFile}`);
    }
}