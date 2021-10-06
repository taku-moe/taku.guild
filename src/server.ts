import "./settings";
import express, { Express } from "express";
import { settings } from "./settings";
import http from "http";
import morgan from "morgan";
import cors from "cors";
import io from "socket.io";
import chalk from "chalk";

/**
 * The main server class that does all the shit you know?
 * @author N1kO23
 * @author Geoxor
 * @author MaidMarija
 * @author Cimok
 */
class Server {
  public express: Express;
  public server: http.Server;
  public io: io.Server;
  constructor() {
    if(settings.auth_key === undefined) {
      console.log(chalk.red("[SERVER] No auth key found! Authentication with master server failed!"));
      process.exit(0);
    }
    this.express = express();
    this.express.use(cors({ origin: "*" }));
    this.express.use(morgan("dev"));
    this.express.use(express.json());

    // this.express.use("/v1", V1);
    this.express.get("/", (req, res) => res.status(200).json({ message: "hello cunt" }));
    this.server = http.createServer(this.express);
    this.io = new io.Server(this.server, { cors: { origin: "*" } });
    this.server.listen(settings.port, () =>
      console.log(chalk.cyan(`[SERVER] Started on port ${settings.port.toString()}`))
    );
  };

  authorizeWithBackend(){
    
  }
}

export const server = new Server();
