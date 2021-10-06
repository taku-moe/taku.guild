console.clear();
import "./settings";
import "./server";
import chalk from "chalk";

const VERSION = process.env.npm_package_version;

console.log(chalk.hex("FF006B")(`
  ______      __        
 /_  __/___ _/ /____  __
  / / / __ \`/ //_/ / / /
 / / / /_/ / ,< / /_/ / 
/_/  \\__,_/_/|_|\\__,_/  v${VERSION} \n`
));

console.log(chalk.hex("333333")('Welcome to hell \n'));