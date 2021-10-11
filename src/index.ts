console.clear();
import "./settings";
import "./server";
import chalk from "chalk";
import fs from "fs";

console.log(
  chalk.hex("FF006B")(`
  ,--.          ,--.            
,-'  '-. ,--,--.|  |,-.,--.,--. 
'-.  .-'' ,-.  ||     /|  ||  | 
  |  |  \\ '-'  ||  \\  \\'  ''  ' 
  \`--'   \`--\`--'\`--'\`--'\`----' \n`)
); // yes

console.log(chalk.hex("333333")("Welcome to hell \n"));

!fs.existsSync("./uploads/attachments") && fs.mkdirSync("./uploads/attachments", { recursive: true });
