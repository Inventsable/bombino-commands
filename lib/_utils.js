const fs = require("fs");
const static = require("./_statics");
const chalk = require("chalk");
const path = require("path");

module.exports = {
  osPrefix: process.platform === "win32" ? "" : `./`,
  cepBlock: `${chalk.black.bgBlue(" CEP ")}`,
  helpPrompt: `${chalk.black.bgBlue(
    " CEP "
  )}  Didn't mean to do that? Use ${chalk.yellow(
    "npm run help"
  )} to see a full list of commands`,
  boxLog(str, color, padded = false) {
    console.log("");
    if (/green/.test(color)) {
      console.log(
        `${padded ? "  " : ""}  ${chalk.black.bgGreen(
          `  ${str.toUpperCase()}  `
        )}`
      );
    } else {
      console.log(
        `${padded ? "  " : ""}  ${chalk.black.bgBlue(
          `  ${str.toUpperCase()}  `
        )}`
      );
    }
    console.log("");
  },
  doneSpinnerText(str, color) {
    if (/green/.test(color))
      return `  ${chalk.black.bgGreen(`  ✔ ${str.toUpperCase()}  `)}`;
    else if (/blue/.test(color))
      return `  ${chalk.black.bgBlue(`  ${str.toUpperCase()}  `)}`;
  },
  getExtVersion() {
    const xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
    const bundleVersion = /ExtensionBundleVersion\=\"(\d|\.)*(?=\")/;
    const matches = xml.match(bundleVersion);
    return matches.length ? matches[0].replace(/\w*\=\"/, "") : "Unknown";
  },
  getExtName() {
    const xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
    const bundleVersion = /Menu\>.*(?=\<)/;
    const matches = xml.match(bundleVersion);
    return matches.length
      ? matches[0]
          .replace(/Menu\>/, "")
          .split(" ")
          .join("-")
      : "Unknown";
  },
  async getToolingModel() {
    let parent = await this.readDir("./");
    let models = [
      {
        name: "QUASAR",
        exclusive: ".quasar"
      },
      {
        name: "VUE",
        exclusive: "vue.config.js"
      }
    ];
    let thismodel = false;
    models.forEach(model => {
      if (parent.includes(model.exclusive)) thismodel = model;
    });
    return thismodel;
  },
  async readDir(thispath) {
    return new Promise((resolve, reject) => {
      fs.readdir(
        path.resolve(thispath),
        { encoding: "utf-8" },
        (err, files) => {
          if (err) reject(err);
          resolve(files);
        }
      );
    });
  }
};
