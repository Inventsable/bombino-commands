const utils = require("./_utils");
const static = require("./_statics");
const fs = require("fs");
const chalk = require("chalk");
const inquirer = require("inquirer");
const boxen = require("boxen");

// Used to determine initial context state [DEVELOPER/PRODUCTION]
const isDev = /\<\!\--\s\<MainPath\>\.\/dist\/(spa\/)?index\.html\<\/MainPath\>\s\-\-\>/gm;
const isBuild = /\<\!\--\s\<MainPath\>\.\/(src|public)\/index\-dev\.html\<\/MainPath\>\s\-\-\>/gm;

module.exports = async function () {
  console.log(`${utils.helpPrompt}`);
  console.log(``);
  const extVersion = utils.getExtVersion();
  const extName = utils.getExtName();
  const extString = `${extName}${extVersion}`;
  let isDev = await getCurrentContext();
  console.log(
    `${utils.cepBlock}  ${chalk.blue(extString)} is in ${chalk.blue(
      `${isDev ? "DEVELOPER" : "PRODUCTION"}`
    )}`
  );
  console.log("");
  let answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "shouldSwitch",
      message: `Would you like to switch to ${chalk.blue(
        `${!isDev ? "DEVELOPER" : "PRODUCTION"}`
      )}?`,
      default: true,
    },
  ]);
  if (answer.shouldSwitch) {
    let res = await switchContext();
    utils.boxLog(`✔  Context switched to ${res}`);
    // console.log(`   ${chalk.green("✔ ")} Switch successful!`);
    endMessage(true);
  } else {
    console.log("");
    console.log(`   All right! No changes have been made.`);
    endMessage();
  }
  return "";
};

async function getCurrentContext() {
  const xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
  return xml ? isDev.test(xml) : false;
}

// Grabs the text in the currently active MainPath tag, and switches it with the inactive tag
//
async function switchContext() {
  let xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
  let inactiveRX = /\<\!\--\s\<MainPath\>(.*)\<\/MainPath\>\s\-\-\>/gm;
  let activeRX = /[^\<\!\--]\s\<MainPath\>(.*)\<\/MainPath\>/gm;
  let activePath = xml.match(activeRX)[0];
  let inactivePath = xml.match(inactiveRX)[0];
  let newActivePath = `  ${
    inactivePath.match(/<MainPath\>.*\<\/MainPath\>/)[0]
  }`;
  let newInactivePath = `<!-- ${activePath.substring(2)} -->`;
  let context = /dev/.test(newActivePath) ? "DEVELOPER" : "PRODUCTION";
  xml = xml.replace(new RegExp(activePath, "gm"), newActivePath);
  xml = xml.replace(new RegExp(inactivePath, "gm"), newInactivePath);
  fs.writeFileSync(`./CSXS/manifest.xml`, xml);
  return context;
}

async function endMessage(switched = false) {
  if (await getCurrentContext())
    console.log(
      `  ${chalk.blue("DEVELOPER")}: Use ${chalk.yellow("npm run serve")} ${
        switched ? "and restart the app to continue developing" : "to continue"
      }.`
    );
  else
    console.log(
      `  ${chalk.blue("PRODUCTION")}: Ready for ${chalk.yellow(
        "npm run serve"
      )} or ${chalk.yellow("npm run sign")}.`
    );
  console.log("");
}
