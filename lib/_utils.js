const fs = require("fs");
const static = require("./_statics");

module.exports = {
  osPrefix: process.platform === "win32" ? "" : `./`,
  cepBlock: `${chalk.black.bgBlue(" CEP ")}`,
  helpPrompt: `${cepBlock}  Didn't mean to do that? Use ${chalk.yellow(
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
  }
};
