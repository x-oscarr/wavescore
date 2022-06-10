import http from "http";
import Thread from "./stream/thread.js";
import Project from "./stream/project.js";
import webApp from "./api/app.js";

const webserver = (thread) => {
    console.log('Web server started');
    const port = process.env.PORT || '3000';
    webApp.set('port', port);
    webApp.set('thread', thread);
    const server = http.createServer(webApp);
    server.listen(port);
}

// Async task to start the radio
export default async (projectName, options) => {
    const project = new Project(projectName)
    const thread = new Thread(await project.init());

    // Run webserver
    options.web && webserver(thread);

    // Start our stream
    thread.run();
};