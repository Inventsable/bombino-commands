const inquirer = require("inquirer");
const fs = require("fs");

module.exports = async function() {
  console.log(`${utils.helpPrompt}`);
  const extVersion = utils.getExtVersion();
  const extName = utils.getExtName();
  console.log("");
  console.log(
    `${utils.cepBlock}  ${chalk.blue(extName)} is currently ${chalk.green(
      `v${extVersion}`
    )}`
  );
  console.log("");
  await inquirer
    .prompt([
      {
        type: "confirm",
        name: "shouldUpdate",
        message: `Update version?`,
        default: true
      }
    ])
    .then(answer => {
      if (answer.shouldUpdate) {
        findTier(extVersion.split(".")).then(answerver => {
          let chosen = extVersion.split(".")[answerver.versionIndex];
          promptNewNumber(chosen).then(ans => {
            let newVersion = extVersion.split(".");
            newVersion[answerver.versionIndex] = ans.newTier;
            setExtVersion(extVersion, newVersion).then(updated => {
              console.log("");
              console.log(`   ${chalk.green("✔ ")} Update successful!`);
              console.log(
                boxen(
                  `${chalk.blue(extName)} updated to ${chalk.green(
                    `v${updated}`
                  )}`,
                  {
                    ...BOXEN_OPTS,
                    ...{
                      borderColor: "blue"
                    }
                  }
                )
              );
            });
          });
        });
      } else {
        console.log("");
        console.log(`   All right! No changes will be made.`);
        endMessage();
      }
    })
    .catch(err => {
      //
    });

  return "";
};

async function findTier(original) {
  return await inquirer.prompt([
    {
      type: "list",
      name: "versionIndex",
      message: "Choose tier to update",
      choices: [
        {
          name: `Major (${original[0]}.x.x)`,
          value: 0
        },
        {
          name: `Minor (x.${original[1]}.x)`,
          value: 1
        },
        {
          name: `Micro (x.x.${original[2]})`,
          value: 2
        }
      ]
    }
  ]);
}

async function promptNewNumber(old) {
  return await inquirer.prompt([
    {
      type: "Number",
      message: "Enter new value for tier",
      default: +old + 1,
      name: "newTier"
    }
  ]);
}

function setExtVersion(older, newer) {
  return new Promise((resolve, reject) => {
    let xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
    let rx = new RegExp(`${older.split(".").join("\\.")}`);
    xml = xml.split(rx).join(newer.join("."));
    fs.writeFileSync(`./CSXS/manifest.xml`, xml);

    let jsondata = fs.readFileSync("./package.json", { encoding: "utf-8" });
    let jsonrx = /\"version\"\:\s\"[^\"]*/;
    jsondata = jsondata
      .split(jsonrx)
      .join(`\"version\"\: \"${newer.join(".")}`);
    fs.writeFileSync(`./package.json`, jsondata);
    resolve(newer.join("."));
  });
}
