const utils = require("./_utils");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const shell = require("shelljs");
const chalk = require("chalk");
const ora = require("ora");
const boxen = require("boxen");
const archiver = require("archiver");

const cmds = {
  sign: require("./sign"),
};

module.exports = async function () {
  let ANSWERS = await promptUser();
  let spinner = null;
  shell.config.silent = true;
  let response;

  if (ANSWERS.runSign) {
    response = await promptUserOfPassword();
  }
  if (ANSWERS.runBuild) {
    spinner = ora({
      text: `Creating new build...`,
      spinner: utils.ORA_SPINNER,
    }).start();
    shell.exec(`npm run build`);
    console.log("");
    spinner.stopAndPersist({
      symbol: "",
      text: utils.doneSpinnerText("Build complete", "green"),
    });
    console.log("");
    shell.config.silent = false;
  }

  if (ANSWERS.runSign) {
    await cmds.sign(response.password);
  }

  let archiveExists = exists("./archive/");
  let packageExists = exists("./package/");
  if (!archiveExists || !packageExists) {
    console.log("Something went wrong");
    return null;
  }

  let ZXPExists = await readDir("./archive/");
  let targetZXP = ZXPExists.filter((item) => {
    return /zxp$/.test(item);
  });

  if (targetZXP.length > 1) {
    targetZXP = targetZXP.sort((a, b) => {
      return (
        +b
          .replace(/.*_/, "")
          .replace(/\.zxp$/, "")
          .split(".")
          .join("") -
        +a
          .replace(/.*_/, "")
          .replace(/\.zxp$/, "")
          .split(".")
          .join("")
      );
    })[0];
  } else if (targetZXP.length > 0) {
    targetZXP = targetZXP[0];
  } else {
    console.log("No valid ZXP files were found in ./archive");
    return null;
  }

  let extName = targetZXP.replace(/_.*/, "");
  let packageName = targetZXP.replace(/\.zxp$/, "");
  console.log("");
  spinner = ora({
    text: `Bundling ${chalk.green(`./archive/${targetZXP}`)} and ${chalk.green(
      `./package/`
    )}...`,
    spinner: utils.ORA_SPINNER,
  }).start();
  let package = await stagePackageFolder(packageName, extName, targetZXP);
  spinner.stopAndPersist({
    symbol: "",
    text: utils.doneSpinnerText("Bundle done", "green"),
  });
  let input = path.resolve(package);
  let output = `${path.resolve(package)}.zip`;

  console.log("");
  spinner = ora({
    text: `Zipping as ${chalk.green(`./archive/${packageName}.zip`)}`,
    spinner: utils.ORA_SPINNER,
  }).start();

  zipDirectory(input, output).then(() => {
    spinner.stopAndPersist({
      symbol: "",
      text: utils.doneSpinnerText("Zip done", "green"),
    });

    console.log("");
    spinner = ora({
      text: `Removing ${chalk.green(
        `./archive/${packageName}`
      )} staging folder...`,
      spinner: utils.ORA_SPINNER,
    }).start();
    fse.removeSync(`./archive/${packageName}`);
    spinner.stopAndPersist({
      symbol: "",
      text: utils.doneSpinnerText("Remove done", "green"),
    });

    utils.boxLog(`${packageName}.zip is ready`, "blue", true);
  });
};

async function stagePackageFolder(packageName, ZXPNewName, ZXPName) {
  let tempdir = [];

  if (await folderExists(`./archive/${packageName}`))
    fse.removeSync(`./archive/${packageName}`);
  if (await exists(`./archive/${packageName}.zip`))
    fse.removeSync(`./archive/${packageName}.zip`);

  let list = await readDir("./package");
  list.forEach((filename) => {
    if (!/\.DS_Store/.test(filename)) {
      if (filename) tempdir.push(filename);
    }
  });

  try {
    fs.mkdirSync(`./archive/${packageName}`);
    for (file of tempdir)
      await fse.copy(`./package/${file}`, `./archive/${packageName}/${file}`);

    await fse.copy(
      `./archive/${ZXPName}`,
      `./archive/${packageName}/${ZXPNewName}.zxp`
    );
    return Promise.resolve(`./archive/${packageName}`);
  } catch (err) {
    return Promise.reject(err);
  }
}

async function promptUser() {
  return await inquirer.prompt([
    {
      type: "confirm",
      name: "runBuild",
      message: `Rerun ${chalk.yellow("npm run build")} before package?`,
      default: false,
    },
    {
      type: "confirm",
      name: "runSign",
      message: `Rerun ${chalk.yellow("npm run sign")} before package?`,
      default: false,
    },
  ]);
}

async function promptUserOfPassword() {
  return await inquirer.prompt([
    {
      type: "input",
      name: "password",
      message: "Password for certificate",
      default: "hello-world",
    },
  ]);
}

function exists(targetPath) {
  return fs.existsSync(path.resolve(targetPath));
}

async function readDir(targetPath) {
  return new Promise((resolve, reject) => {
    if (!exists(targetPath) || !isFolder(targetPath))
      reject("Path is not a folder or does not exist");
    fs.readdir(
      path.resolve(targetPath),
      { encoding: "utf-8" },
      (err, files) => {
        if (err) reject(err);
        resolve(files);
      }
    );
  });
}

function folderExists(targetPath) {
  return exists(targetPath) && isFolder(targetPath);
}

function isFolder(targetPath) {
  return fs.lstatSync(path.resolve(targetPath)).isDirectory();
}

/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
}
