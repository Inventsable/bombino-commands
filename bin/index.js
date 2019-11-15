#!/usr/bin/env node

const cmds = {
  help: require("../lib/help"),
  switch: require("../lib/switch"),
  update: require("../lib/update"),
  register: require("../lib/register"),
  sign: require("../lib/sign")
};

async function init() {
  Object.keys(cmds).forEach(action => {
    if (new RegExp(`${action}`).test(process.argv)) cmds[action]();
  });
}

init();
