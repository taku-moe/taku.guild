console.clear();
import express, { Express } from "express";
import http from "http";
import morgan from "morgan";
import cors from "cors";
import io from "socket.io";
import fs from "fs";
import { settings } from "./settings";
import chalk from "chalk";

settings;

console.log(chalk.hex("FF006B")(`
  ______      __        
 /_  __/___ _/ /____  __
  / / / __ \`/ //_/ / / /
 / / / /_/ / ,< / /_/ / 
/_/  \\__,_/_/|_|\\__,_/  v${process.env.npm_package_version} \n`
));

console.log(chalk.hex("333333")('Welcome to hell \n'));