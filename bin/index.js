#!/usr/bin/env node

const help = require("../lib/help");
const switcher = require("../lib/switch");
const update = require("../lib/update");

const bomb = {
  help: help,
  switcher: switcher,
  update: update
};

async function init() {
  Object.keys(bomb).forEach(action => {
    if (new RegExp(`${action}`).test(process.argv)) bomb[action]();
  });
}

init();
