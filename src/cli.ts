#!/usr/bin/env node

import commander from "commander";
import { translate } from "./main";
const program = new commander.Command();

const pck = require("../package.json");

// argument与command区别，argument只是用来接收且只有一个参数，而command是命令理解为需要接收指定的参数
program
  .version(pck.version)
  .name("translation-tools")
  .usage("<English>")
  .argument("<English>")
  .action((english) => {
    translate(english);
  });

program.parse(process.argv);
