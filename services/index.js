import Container from "../libs/serviceContainer.js";
import historyService from "./history.service.js";
import getConfig from "./config.service.js";

const container = new Container(await getConfig());

container.register('stream.history', historyService)

export default container



