const utils = require("./_utils");
const chalk = require("chalk");

module.exports = async function() {
  const extVersion = utils.getExtVersion();
  const extName = utils.getExtName();

  const model = await utils.getToolingModel();
  const modelBlock = ` ${model.name.substring(0, 3)} `;
  console.log("");
  console.log("   Welcome! You can run these commands at any time:");
  console.log("");
  console.log(
    `${chalk.black.bgGreen(modelBlock)} ${chalk.yellow(
      `npm run serve`
    )} — Run the development server (${chalk.blue("DEVELOPER")})`
  );
  console.log(
    `${chalk.black.bgGreen(modelBlock)} ${chalk.yellow(
      `npm run build`
    )} — Compile to ${chalk.green(
      `/dist/${/quasar/i.test(model.name) ? "spa/" : ""}`
    )} directory (${chalk.blue("PRODUCTION")})`
  );
  console.log(
    `${utils.cepBlock} ${chalk.yellow(
      "npm run switch"
    )} — Switch between ${chalk.blue("DEVELOPER")} and ${chalk.blue(
      "PRODUCTION"
    )}`
  );
  console.log(
    `${utils.cepBlock} ${chalk.yellow(
      "npm run update"
    )} — Update the panel's version`
  );
  console.log(
    `${utils.cepBlock} ${chalk.yellow(
      "npm run register"
    )} — Register the info to be used in ${chalk.yellow("npm run sign")}`
  );
  console.log(
    `${utils.cepBlock} ${chalk.yellow(
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
      `https://github.com/Inventsable/generator-cep-${model.name.toLowerCase()}-cli#templates`
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
  console.log("");
  return "";
};
