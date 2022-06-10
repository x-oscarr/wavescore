import Container from "../libs/serviceContainer.js";
import getConfig from "../configs/index.js";

const container = new Container(await getConfig());

export default container



