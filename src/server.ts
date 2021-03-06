import "./settings";
import express, { Express } from "express";
import { settings } from "./settings";
import http from "http";
import morgan from "morgan";
import cors from "cors";
import io from "socket.io";
import chalk from "chalk";
import axios from "axios";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import fs from "fs";
import { Member } from "./models/Member";
import { v4 as uuidv4 } from "uuid";
import { V1 } from "./routes";
import { Message } from "./models/Message";
import { staticRouter } from "./routes/static";
import { Auri, auri } from "./auri";
import mongoose from "mongoose";
import chokidar from "chokidar";

/**
 * The main server class that does all the shit you know?
 * @author N1kO23
 * @author Geoxor
 * @author MaidMarija
 * @author Cimok
 */
class Server {
  public stats: Auri = auri;
  public express: Express;
  public server: http.Server;
  public io: io.Server;
  private backendURL = process.env.DEV ? "http://localhost:8081" : "https://backend.taku.moe";
  private token: string | undefined;
  private uuid: string | undefined;
  constructor() {
    console.log(`connecting to mongo ${settings.database_url}`);
    mongoose.connect(settings.database_url).then(() => console.log("connected to mongo"));
    this.express = express();
    this.registerExpressRoutes();
    this.server = http.createServer(this.express);
    this.io = new io.Server(this.server, { cors: { origin: "*" } });
    this.io.on("connection", async (socket) => {
      console.log("new connection");
      if (!this.token || !socket.handshake.auth) return;
      let userUUID = "";
      try {
        userUUID = jwt.verify(socket.handshake.auth.token, this.token) as string;
        if (!(await Member.findOne({ member_id: userUUID })))
          await new Member({ _id: uuidv4(), member_id: userUUID }).save();
      } catch (error) {
        console.log(error);
        socket.disconnect();
      }

      socket.on("pong", (pong) => {
        const { cpu, ram, network } = this.stats.dataAll;
        socket.emit("ping", { pong, cpu, ram, network });
      });

      socket.on("message", async (data) => {
        if (!data.channel_id) return;
        const message = await new Message({
          _id: uuidv4(),
          created_at: Date.now(),
          content: data.content,
          replying_to: data.replyingTo,
          author_id: userUUID,
          channel_id: data.channel_id,
        })
          .save()
          .catch((err) => console.log(err));

        this.io.emit("message", message);
      });

      socket.on("disconnect", () => console.log("socked disconnected"));
    });
    this.server.listen(settings.port, () =>
      console.log(chalk.cyan(`[SERVER] Started on port ${settings.port.toString()}`))
    );
    this.authorizeWithBackend();
    this.updateHostname();
    settings.enable_explorer && this.watchExplorer();
  }

  private parseLinuxDir(path: string) {
    return "." + path.replace(settings.explorer_directory, "");
  }

  private linuxWatcherHandler(path: string, eventName: string) {
    const wsEvent = `explorer:${eventName}`;
    const targetPath = this.parseLinuxDir(path);
    console.log(wsEvent, targetPath);
    this.io.emit(wsEvent, targetPath);
  }

  public async watchExplorer() {
    if (process.platform !== "linux") {
      fs.watch(settings.explorer_directory, { recursive: true }, async (eventType, filePath) => {
        const absolutePath = settings.explorer_directory + "/" + filePath;
        const targetPath = `./${filePath.replace(/\\/g, "/")}`;
        switch (eventType) {
          case "rename":
            if (fs.existsSync(absolutePath)) {
              this.io.emit(`explorer:rename`, targetPath);
            } else {
              this.io.emit(`explorer:unlink`, targetPath);
            }
          default:
            break;
        }
      });
    } else {
      console.log("using chokidar");

      const watcher = chokidar.watch(settings.explorer_directory, {
        depth: 99,
        persistent: true,
      });

      watcher
        .on("addDir", (path) => this.linuxWatcherHandler(path, "rename"))
        .on("add", (path) => this.linuxWatcherHandler(path, "rename"))
        .on("change", (path) => this.linuxWatcherHandler(path, "rename"))
        .on("unlink", (path) => this.linuxWatcherHandler(path, "unlink"));
    }
  }

  private registerExpressRoutes() {
    this.express.use(
      cors({
        origin: (origin: any, callback: any) => callback(null, true),
      })
    );
    this.express.use(morgan("dev"));
    this.express.use(express.json());
    this.express.use("/static", staticRouter);
    this.express.use("/v1", V1);
    this.express.get("/", (req, res) => res.status(200).json({ message: "hello cunt" }));
    // this.express.get("/metadata", async (req, res) =>
    //   res.status(200).json({
    //     _id: this.uuid,
    //     name: "Test server",
    //     members: (await Member.find()).map((member) => member.member_id),
    //   })
    // );
    this.express.post("/login", async (req, res) => {
      if (!this.token) return res.status(403);
      const { uuid } = req.body;
      if (await this.checkIfUserExists(uuid))
        res.status(200).json({
          token: jwt.sign(uuid, this.token),
          guild_id: this.uuid,
        });
    });
    this.express.get("/avatar", async (req, res) => {
      const avatarPNG = process.cwd() + "/avatar.png";
      const avatarGIF = process.cwd() + "/avatar.gif";
      if (fs.existsSync(avatarGIF)) return res.status(200).sendFile(avatarGIF);
      if (fs.existsSync(avatarPNG)) {
        const image = sharp(avatarPNG);
        const buffer = await image.resize({ width: 64 }).webp().toBuffer();
        return res.writeHead(200, [["Content-Type", "image/webp"]]).end(buffer);
      }
      return res.status(404).send();
    });
    this.express.get("/banner", async (req, res) => {
      const bannerPNG = process.cwd() + "/banner.png";
      const bannerGIF = process.cwd() + "/banner.gif";
      if (fs.existsSync(bannerGIF)) return res.status(200).sendFile(bannerGIF);
      if (fs.existsSync(bannerPNG)) {
        const image = sharp(bannerPNG);
        const buffer = await image.resize({ height: 720 }).webp().toBuffer();
        return res.writeHead(200, [["Content-Type", "image/webp"]]).end(buffer);
      }
      res.status(404).send();
    });
  }

  public async checkIfUserExists(uuid: string) {
    if (!this.token) return;

    try {
      const response = await axios(this.backendURL + `/v1/user/${uuid}`, {
        headers: {
          Authorization: this.token,
        },
      });
      const { data } = response;
      if (data) return true;
      return false;
    } catch (error) {
      console.log(error);
    }
  }

  public async authorizeWithBackend() {
    const response = await axios({
      method: "POST",
      url: this.backendURL + "/v1/guild/auth",
      data: {
        key: settings.auth_key,
      },
    });

    const data = response.data as { code: string; token: string; uuid: string };
    this.token = data.token;
    this.uuid = data.uuid;
    console.log(`Server UUID: ${this.uuid}`);
  }

  public async updateHostname() {
    await axios({
      method: "PATCH",
      url: this.backendURL + "/v1/guild",
      data: {
        key: settings.auth_key,
        hostname: settings.hostname,
        enable_explorer: settings.enable_explorer,
      },
    });
  }
}

export const server = new Server();
