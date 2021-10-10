console.clear();
import "./settings";
import "./server";
import chalk from "chalk";
import fs from "fs";

const VERSION = process.env.npm_package_version;

console.log(
  chalk.hex("FF006B")(`
  ,--.          ,--.            
,-'  '-. ,--,--.|  |,-.,--.,--. 
'-.  .-'' ,-.  ||     /|  ||  | 
  |  |  \\ '-'  ||  \\  \\'  ''  ' 
  \`--'   \`--\`--'\`--'\`--'\`----' v${VERSION} \n`)
); // yes

console.log(chalk.hex("333333")("Welcome to hell \n"));

!fs.existsSync("./uploads/attachments") && fs.mkdirSync("./uploads/attachments", { recursive: true });
