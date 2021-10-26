import fs from "fs";
import chalk from "chalk";

interface ISettings {
  port: number;
  ip: string | null;
  hostname: string | undefined;
  use_internal_db: boolean;
  explorer_directory: string | null;
  database_url: string | null;
  is_whitelisted: boolean;
  enable_explorer: boolean;
  auth_key: string | undefined;
}

/**
 * Creates a settings JSON and loads it from the same folder the executable is in
 * @author N1kO23
 * @author Geoxor
 * @author MaidMarija
 * @author Cimok
 */
class Settings implements ISettings {
  public port: number;
  public ip: string | null;
  public use_internal_db: boolean;
  public database_url: string;
  public explorer_directory: string;
  public is_whitelisted: boolean;
  public enable_explorer: boolean = true;
  public auth_key: string | undefined;
  public hostname: string | undefined;

  constructor() {
    !fs.existsSync("./settings.json") && this.save();
    const { port, use_internal_db, ip, explorer_directory, enable_explorer, is_whitelisted, database_url, auth_key, hostname } = JSON.parse(
      fs.readFileSync("./settings.json", { encoding: "utf-8" })
    ) as ISettings;
    this.ip = !!ip ? ip : "";
    this.database_url = database_url ?? "mongodb://localhost:27017/taku";
    this.explorer_directory = explorer_directory ?? "./uploads/explorer";
    this.port = port ?? 9669;
    this.hostname = hostname ?? "http://127.0.0.1:9669";
    this.is_whitelisted = is_whitelisted ?? false;
    this.enable_explorer = enable_explorer ?? true;
    this.use_internal_db = use_internal_db ?? true;
    this.auth_key = !!auth_key ? auth_key : "";

    if (this.auth_key === "") {
      console.error(chalk.red("[FATAL] No auth key found! Authentication with master server failed!"));
      process.exit(0);
    }
    this.save();
  }

  save() {
    fs.writeFileSync("./settings.json", JSON.stringify(this, null, 2));
  }
}

export const settings = new Settings();
