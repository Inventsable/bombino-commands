const utils = require("./_utils");
const chalk = require("chalk");
const cepBlock = `${chalk.black.bgBlue(" CEP ")}`;

module.exports = () => {
  const extVersion = utils.getExtVersion();
  const extName = utils.getExtName();
  console.log("   Welcome! You can run these commands at any time:");
  console.log("");
  console.log(
    `${chalk.black.bgGreen(" QUA ")} ${chalk.yellow(
      "quasar dev"
    )} — Run the development server (${chalk.blue("DEVELOPER")})`
  );
  console.log(
    `${chalk.black.bgGreen(" QUA ")} ${chalk.yellow(
      "quasar build"
    )} — Compile to ${chalk.green("./dist/spa/")} directory (${chalk.blue(
      "PRODUCTION"
    )})`
  );
  console.log(
    `${cepBlock} ${chalk.yellow(
      "npm run switch"
    )} — Switch between ${chalk.blue("DEVELOPER")} and ${chalk.blue(
      "PRODUCTION"
    )}`
  );
  console.log(
    `${cepBlock} ${chalk.yellow("npm run update")} — Update the panel's version`
  );
  console.log(
    `${cepBlock} ${chalk.yellow(
      "npm run register"
    )} — Register the info to be used in ${chalk.yellow("npm run sign")}`
  );
  console.log(
    `${cepBlock} ${chalk.yellow(
      "npm run sign"
    )} — Stage, sign, and certify panel with result as ${chalk.green(
      `./archive/${extName}${extVersion}.zxp`
    )}`
  );
  console.log("");
  console.log(
    `   - Documentation per template can be found at the generator repo here:`
  );
  console.log(
    `     ${chalk.blue(
      "https://github.com/Inventsable/generator-cep-quasar-cli#templates"
    )}`
  );
  console.log("");
  console.log(
    `   - An outline of how to use this workflow and what each command does can be found here:`
  );
  console.log(
    `     ${chalk.blue(
      "https://github.com/Inventsable/CEP-Self-Signing-Panel#usage"
    )}`
  );
  console.log(
    `     ${chalk.blue(
      "https://github.com/Inventsable/CEP-Self-Signing-Panel#what-do-they-do"
    )}`
  );
  return "";
};
