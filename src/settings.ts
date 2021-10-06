import fs from "fs";

interface ISettings {
  port: number;
  ip: string | null;
  use_internal_db: boolean;
  database_url: string | null;
  is_whitelisted: boolean;
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
  public database_url: string | null;
  public is_whitelisted: boolean;

  constructor() {
    !fs.existsSync("./settings.json") && this.saveSettings();
    const {port, use_internal_db, ip, is_whitelisted, database_url} = JSON.parse(fs.readFileSync("./settings.json", {encoding: 'utf-8'})) as ISettings;
    this.ip = !!ip ? ip : "";
    this.database_url = !!database_url ? database_url : "";
    this.port = port ?? 9669;
    this.is_whitelisted = is_whitelisted ?? false;
    this.use_internal_db = use_internal_db ?? true;
    this.saveSettings();
  }

  saveSettings(){
    fs.writeFileSync("./settings.json", JSON.stringify(this, null, 2))
  }
}

export const settings = new Settings();