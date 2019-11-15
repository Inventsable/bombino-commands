const fs = require("fs");
const static = require("./_statics");
const chalk = require("chalk");
const path = require("path");

module.exports = {
  osPrefix: process.platform === "win32" ? "" : `./`,
  cepBlock: `${chalk.black.bgBlue(" CEP ")}`,
  helpPrompt: `${this.cepBlock}  Didn't mean to do that? Use ${chalk.yellow(
    "npm run help"
  )} to see a full list of commands`,
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
  },

  async findHost(search) {
    let contents = await this.readDir(search);
    if (contents.includes("host")) return search + "/host";
    else {
      let valids = contents.filter(child => {
        return fs
          .lstatSync(`${search.replace(/\/$/, "")}/${child}`)
          .isDirectory();
      });
      valids.forEach(folder => {
        return await this.findHost(`${search.replace(/\/$/, "")}/${child}`);
      });
    }
    return search;
  }
};
