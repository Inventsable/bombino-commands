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
const extVersion = utils.getExtVersion();

const cmds = {
  sign: require("./sign"),
};

module.exports = async function () {
  const ROOT = path.resolve("./");
  let ANSWERS = await promptUser();
  let spinner = null;
  shell.config.silent = true;
  let response;
  let isDev = await isDevContext();
  // If user wants to sign, prompt for password so all prompts are upfront
  if (ANSWERS.runSign) {
    response = await promptUserOfPassword();
  }
  // Ensure that the correct Production context will be in the Package if build/sign
  if (ANSWERS.runBuild || ANSWERS.runSign) {
    if (isDev) {
      switchContext();
      console.log("");
      console.log(`    ✔  Context switched to ${chalk.blue("PRODUCTION")}`);
      console.log("");
      setTimeout(() => {
        continueProcess(ROOT, ANSWERS, spinner, response, isDev);
      }, 500);
    } else {
      continueProcess(ROOT, ANSWERS, spinner, response, isDev);
    }
  } else {
    continueProcess(ROOT, ANSWERS, spinner, response, isDev);
  }
};

async function continueProcess(ROOT, ANSWERS, spinner, response, isDev) {
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

  if (ANSWERS.runSign) {
    targetZXP = `${utils.getExtName()}_${utils.getExtVersion()}.zxp`;
  }

  let extName = targetZXP.replace(/_.*/, "");
  let packageName = targetZXP.replace(/\.zxp$/, "");

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
    if (await exists(`./archive/${packageName}_${extVersion}.zxp`)) {
      fse.removeSync(`./archive/${packageName}.zxp`);
    }
    console.log(
      `Context pre-sign check: ${chalk.blue(
        (await isDevContext()) ? "DEVELOPER" : "PRODUCTION"
      )}`
    );
    console.log("");
    await cmds.sign(response.password);
    shell.cd(ROOT);

    console.log(
      `    Context post-sign check: ${chalk.blue(
        (await isDevContext()) ? "DEVELOPER" : "PRODUCTION"
      )}`
    );
    console.log("");
  }

  if (!ANSWERS.runSign) console.log("");
  spinner = ora({
    text: `Bundling ${chalk.green(`./archive/${targetZXP}`)} and ${chalk.green(
      `./package/`
    )}...`,
    spinner: utils.ORA_SPINNER,
  }).start();

  ZXPExists = await readDir("./archive/");
  targetZXP = ZXPExists.filter((item) => {
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

  extName = targetZXP.replace(/_.*/, "");
  packageName = targetZXP.replace(/\.zxp$/, "");

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
    if (ANSWERS.runSign) fse.removeSync(`./archive/${targetZXP}`);
    spinner.stopAndPersist({
      symbol: "",
      text: utils.doneSpinnerText("Remove done", "green"),
    });

    utils.boxLog(`${packageName}.zip package is ready`, "blue", true);

    if (isDev && (ANSWERS.runBuild || ANSWERS.runSign)) {
      setTimeout(() => {
        switchContext();
        console.log(
          `    ✔  Context switched back to ${chalk.blue("DEVELOPER")}`
        );
        console.log("");
      }, 500);
    }
  });
}

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
      message: `Run ${chalk.yellow("npm run build")} before package?`,
      default: false,
    },
    {
      type: "confirm",
      name: "runSign",
      message: `Run ${chalk.yellow("npm run sign")} before package?`,
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

function switchContext() {
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

async function isDevContext() {
  const xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
  return xml
    ? Promise.resolve(
        /\<\!\--\s\<MainPath\>\.\/dist\/(spa\/)?index\.html\<\/MainPath\>\s\-\-\>/gm.test(
          xml
        )
      )
    : Promise.resolve(false);
}
