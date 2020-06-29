#!/usr/bin/env node

const cmds = {
  help: require("../lib/help"),
  switch: require("../lib/switch"),
  update: require("../lib/update"),
  register: require("../lib/register"),
  sign: require("../lib/sign"),
};

// What is going on here? Commands are suddenly firing arbitrarily.
// Update keeps firing on either switch or sign?
async function init() {
  // Object.keys(cmds).forEach(action => {
  //   if (new RegExp(`${action}`).test(process.argv)) cmds[action]();
  // });
  if (/help/.test(process.argv)) cmds.help();
  else if (/switch/.test(process.argv)) cmds.switch();
  else if (/register/.test(process.argv)) cmds.register();
  else if (/sign/.test(process.argv)) cmds.sign();
  else if (/update/.test(process.argv)) cmds.update();
}

init();
