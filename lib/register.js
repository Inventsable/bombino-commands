const shell = require("shelljs");
const fs = require("fs");
const chalk = require("chalk");
const inquirer = require("inquirer");
const utils = require("./_utils");

module.exports = async function() {
  console.log(`${utils.helpPrompt}`);
  console.log(``);
  let user = shell.exec("git config user.name", { silent: true }).stdout;
  user = user.replace(" ", "-").trim();
  let certInfo;
  if (fs.existsSync(`./src/utils/dev/certInfo.txt`)) {
    certInfo = fs.readFileSync(`./src/utils/dev/certInfo.txt`, {
      encoding: "utf-8"
    });
    console.log(
      `${cepBlock}  Current string for certs is ${chalk.green(
        certInfo.split(";").join(" ")
      )}`
    );
    console.log("");
  } else {
    certInfo = "US;NY;SomeOrg";
    console.log(
      `${chalk.red(
        "✘ "
      )} No user data was found! It will default to ${chalk.green(
        certInfo.split(";").join(" ")
      )}`
    );
  }
  certInfo = certInfo.split(";");
  if (certInfo.length < 4) certInfo = [].concat(certInfo, [user]);
  promptRegister(certInfo).then(answer => {
    let fulldetails = [answer.country, answer.state, answer.org, answer.name];
    let finaldetails = fulldetails.map(ans => {
      return /\s/.test(ans) ? ans.split(" ").join("-") : ans;
    });
    fs.writeFileSync(`./src/utils/dev/certInfo.txt`, finaldetails.join(";"));
    console.log("");
    console.log(
      `   ${chalk.green("✔ ")} Config has been saved to ${chalk.green(
        "./src/utils/dev/certInfo.txt"
      )}`
    );
    console.log(
      `   Self-signed certificates via ${chalk.yellow(
        "npm run sign"
      )} will use this data!`
    );
    console.log("");
  });
};

async function promptRegister(data) {
  return await inquirer.prompt([
    {
      type: "input",
      name: "country",
      message: "Country Code",
      default: data[0]
    },
    {
      type: "input",
      name: "state",
      message: "State or Province",
      default: data[1]
    },
    {
      type: "input",
      name: "org",
      message: "Organization",
      default: data[2]
    },
    {
      type: "input",
      name: "name",
      message: "Common name",
      default: data[3]
    }
  ]);
}
