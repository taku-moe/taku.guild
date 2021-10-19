import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import fs from "fs";

export type CPUCore = {load: number};
export type Disk = {
  available: number;
  fs: string;
  mount: string;
  size: number;
  type: string;
  use: number;
  used: number;
};
export type NetworkInterface = {rx_sec: number, tx_sec: number};
export type RAM = {free: number, total: number};

export interface SystemData {
  cpu: CPUCore[];
  disks: Disk[];
  network: NetworkInterface[];
  ram: RAM;
}

export interface SystemStats {
  cpu: number;
  network: number;
  ram: RAM;
}

/**
 * Auri data collector handler for windows
 * This class handles the auri process and buffers the data from it
 * So we can easily use it in the getStats file
 * @author Niko Huuskonen
 */
export class Auri {
  private process: ChildProcessWithoutNullStreams | undefined;
  public data: SystemData = {
    cpu: [],
    disks: [],
    network: [],
    ram: {free: 0, total: 0},
  };

  constructor() {
    const files = fs.readdirSync("./bin");
    for (const file of files) {
      if (file.startsWith("auri")) {
        // Start the process
        this.process = spawn(`./bin/${file}`, {
          windowsHide: true,
        });
      }
    }

    // Prepare an empty object to buffer the stuff in

    // Parse data coming from Auri
    this.process?.stdout.on("data", (data) => (this.data = this.parseAuriData(data)));
  }

  private parseAuriData(data: any) {
    data = data.toString();
    try {
      data = JSON.parse(data);
    } catch (error) {}
    return data;
  }

  public get cpuLoad() {
    return this.data.cpu.reduce((a: any, b: any) => a + b.load, 0) / this.data.cpu.length;
  }

  public get bandwidth() {
    return this.data.network.reduce((a, b) => a + b.tx_sec + b.rx_sec, 0);
  };

  public get cores() {
    return this.data.cpu.map((core: any) => core.load);
  }

  public get ram() {
    return this.data.ram;
  }

  public get disks() {
    return this.data.disks;
  }

  public get network() {
    return this.data.network;
  }

  public get dataAll() {
    return { cpu: this.cpuLoad, ram: this.ram, network: this.bandwidth } as SystemStats;
  }
}

export const auri = new Auri();
