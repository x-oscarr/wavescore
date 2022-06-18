import fs from "fs";
import chalk from "chalk";
import appRoot from "app-root-path";
import sc from "../../services/index.js"
import path from "path";
import {fileURLToPath} from "url";

const createDirectoryContents = (templatePath, newProjectPath) => {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach(file => {
    if (!file) {
      return;
    }

    const origFilePath = path.join(templatePath, file);
    const writePath = path.join(newProjectPath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      console.log('📝', chalk.magenta(`Copying file to ${writePath} ...`));
      fs.copyFileSync(origFilePath, writePath);
    } else if (stats.isDirectory()) {
      console.log('📁', chalk.magenta(`Creating a directory at ${writePath} ...`));
      fs.mkdirSync(writePath);

      // recursive call for directories
      createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`);
    }
  });
}

export default (projectName) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // If the call occurs inside the app folder, then specify the project folder from the configurations
  const projectPath = appRoot.path === process.cwd()
    ? sc.config.stream.projectsFolder + projectName
    : projectName;

  console.log(chalk.green(`🎵 Generating a new stream project: ${chalk.blue(projectName)} 🎵`));

  // Create project folder
  console.log('📁', chalk.magenta(`Creating a directory at ${projectPath} ...`));
  fs.existsSync(projectPath) || fs.mkdirSync(projectPath, { recursive: true });

  // Fill the project directory with the template
  createDirectoryContents(`${__dirname}/template`, projectPath);
  console.log(chalk.green(`Project created at: ${projectPath} !`), '🎉');
};
