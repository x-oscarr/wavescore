import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import appRoot from "app-root-path";
import sc from "../../services/index.js";

const getProjectPrompt = () => {
    const getDirectories = (path) => {
        return fs.readdirSync(path).filter(function (file) {
            const filePath = path + '/' + file;
            if(!fs.statSync(filePath).isDirectory()) {
                return false;
            }

            return (fs.existsSync(filePath + '/' + 'config.json') || fs.existsSync(filePath + '/' + 'config.js'))
        });
    }

    return inquirer.prompt({
        type: 'list',
        name: 'project',
        message: 'What project do you want to start?',
        choices: getDirectories(sc.config.stream.projectsFolder),
    })
        .then((answers) => {
            return path.join(sc.config.stream.projectsFolder, answers.project);
        });
}

export default async (projectName) => {
    let projectPath;
    if(appRoot.path === process.cwd()) {
        projectPath = projectName
            ? sc.config.stream.projectsFolder + projectName
            : await getProjectPrompt();
    } else {
        projectPath = projectName
            ? process.cwd() + '/' + projectName
            : process.cwd()
    }

    return path.normalize(projectPath + '/');
}