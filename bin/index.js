#!/usr/bin/env node

const help = require("../lib/help.js");
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

// const greeting = `Hello, ${options.action}!`;
const bomb = {
  help: help
};

async function init() {
  console.log("Hello world!");
  console.log(process.argv);
  const actions = ["help", "register"];
  actions.forEach(action => {
    if (new RegExp(`${action}`).test(process.argv)) bomb[action]();
  });
}

init();
