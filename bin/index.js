#!/usr/bin/env node

const help = require("../lib/help");
const switcher = require("../lib/switch");
const yargs = require("yargs");
const options = yargs
  .option("run", {
    alias: "r",
    describe: "run your program"
  })
  .option("path", {
    alias: "p",
    describe: "provide a path to file"
  })
  .option("spec", {
    alias: "s",
    describe: "program specifications"
  });

const bomb = {
  help: help,
  switcher: switcher
};

async function init() {
  const actions = ["help", "switcher"];
  actions.forEach(action => {
    if (new RegExp(`${action}`).test(process.argv)) bomb[action]();
  });
}

init();
