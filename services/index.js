import Container from "../libs/serviceContainer.js";
import getConfig from "../configs/index.js";
import Logger from "./logger.service.js";

const container = new Container(await getConfig());

container.register('logger', Logger);

export default container



