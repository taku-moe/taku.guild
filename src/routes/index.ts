import guild from "./v1/guild";
import fileExplorer from "./v1/fileExplorer";
import { settings } from "../settings";

const routes = [guild];

settings.enable_explorer && routes.push(fileExplorer)

export const V1 = routes;