import http from "http";
import sc from '../services/index.js';
import getProjectConfig from "../libs/projectConfig.js";
import ppath from "./helpers/projectsPath.js";
import stream from "./server/index.js";
import app from "../api/app.js";

const webserver = (config) => {
    console.log('Web server started');
    const port = process.env.PORT || '3000';
    app.set('port', port);

    const server = http.createServer(app);
    server.listen(port);
}

// Async task to start the radio
export default async (projectName, options) => {
    const projectPath = await ppath(projectName);
    // Set our number of history items
    const config = await getProjectConfig(projectPath);

    sc.get('stream.history').setNumberOfHistoryItems(config.api.number_of_history_items);

    // Run webserver
    options.web && webserver(config);

    // Start the api
    // const api = require('./api/index.js');
    // await api.start(projectPath, () => getConfig(projectPath, historyService), stream);

    // Start our stream
    await stream.start(sc, projectPath, config, undefined);
};