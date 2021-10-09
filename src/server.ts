import "./settings";
import express, { Express } from "express";
import { settings } from "./settings";
import http from "http";
import morgan from "morgan";
import cors from "cors";
import io from "socket.io";
import chalk from "chalk";
import axios from "axios";
import jwt from "jsonwebtoken";
import fs from "fs";

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
  private backendURL = "http://localhost:8081";
  private token: string | undefined;
  private uuid: string | undefined;
  constructor() {
    this.express = express();
    this.registerExpressRoutes();
   
    this.server = http.createServer(this.express);
    this.io = new io.Server(this.server, { cors: { origin: "*" } });
    this.io.on("connection", async socket => {
      console.log("new connection");
      if (!this.token || !socket.handshake.auth) return;
      jwt.verify(socket.handshake.auth.token, this.token);
      socket.on("disconnect", () => console.log('socked disconnected'));
    });
    this.server.listen(settings.port, () =>console.log(chalk.cyan(`[SERVER] Started on port ${settings.port.toString()}`)));
    this.authorizeWithBackend();
  };

  private registerExpressRoutes(){
    this.express.use(cors({ origin: "*" }));
    this.express.use(morgan("dev"));
    this.express.use(express.json());

    // this.express.use("/v1", V1);
    this.express.get("/", (req, res) => res.status(200).json({ message: "hello cunt" }));
    this.express.get("/metadata", (req, res) => res.status(200).json({ 
      _id: this.uuid,
      name: 'Test server',
    }));
    this.express.post("/login", async (req, res) => {
      if (!this.token) return res.status(403);
      const {uuid } = req.body;
      if (await this.checkIfUserExists(uuid)) res.status(200).json({
        token: jwt.sign(uuid, this.token),
        guild_id: this.uuid,
      });
    });
    this.express.get("/avatar", async (req, res) => {
      const avatarPNG = __dirname + '/avatar.png';
      const avatarGIF = __dirname + '/avatar.gif';
      if (fs.existsSync(avatarGIF)) return res.status(200).sendFile(avatarGIF);
      if (fs.existsSync(avatarPNG)) return res.status(200).sendFile(avatarPNG);
      res.status(404).send();
    });
    this.express.get("/banner", async (req, res) => {
      const bannerPNG = __dirname + '/banner.png';
      const bannerGIF = __dirname + '/banner.gif';
      if (fs.existsSync(bannerGIF)) return res.status(200).sendFile(bannerGIF);
      if (fs.existsSync(bannerPNG)) return res.status(200).sendFile(bannerPNG);
      res.status(404).send();
    });
  }

  public async checkIfUserExists(uuid: string) {
    if (!this.token) return;
    console.log(uuid);
    
    try {
      const response = await axios(this.backendURL + `/v1/user/${uuid}`, {
        headers: {
          Authorization: this.token
        }
      })
      const { data } = response;
      if (data) return true;
      return false;
    } catch (error) {
      console.log(error);
    }
  }

  public async authorizeWithBackend(){
    const response = await axios({
      method: "POST",
      url: this.backendURL + '/v1/guild/auth',
      data: {
        key: settings.auth_key,
      }
    })

    const data = response.data as {code: string; token: string, uuid: string};
    this.token = data.token;
    this.uuid = data.uuid;
  };
}

export const server = new Server();
