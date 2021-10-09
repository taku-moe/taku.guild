import fs from "fs";
import chalk from "chalk";

interface ISettings {
  port: number;
  ip: string | null;
  hostname: string | undefined;
  use_internal_db: boolean;
  database_url: string | null;
  is_whitelisted: boolean;
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
  public is_whitelisted: boolean;
  public auth_key: string | undefined;
  public hostname: string | undefined;

  constructor() {
    !fs.existsSync("./settings.json") && this.save();
    const { port, use_internal_db, ip, is_whitelisted, database_url, auth_key, hostname } = JSON.parse(
      fs.readFileSync("./settings.json", { encoding: "utf-8" })
    ) as ISettings;
    this.ip = !!ip ? ip : "";
    this.database_url = database_url ?? "mongodb://localhost:27017/taku";
    this.port = port ?? 9669;
    this.hostname = hostname ?? 'localhost:9669';
    this.is_whitelisted = is_whitelisted ?? false;
    this.use_internal_db = use_internal_db ?? true;
    this.auth_key = !!auth_key ? auth_key : "";
    if(this.auth_key === "") {
      console.error(chalk.red("[FATAL] No auth key found! Authentication with master server failed!"));
      process.exit(0);
    };
    this.save();
  }

  save() {
    fs.writeFileSync("./settings.json", JSON.stringify(this, null, 2));
  }
}

export const settings = new Settings();
