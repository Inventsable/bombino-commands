const fs = require("fs");
const utils = require("./_utils");

module.exports = async function() {
  console.log(`${utils.helpPrompt}`);
  console.log(``);
  const extVersion = utils.getExtVersion();
  const extName = utils.getExtName();
  const extString = `${extName}${extVersion}`;

  let isDev = await getCurrentContext();
  console.log(
    `${cepBlock}  ${chalk.blue(extString)} is in ${chalk.blue(
      `${isDev ? "DEVELOPER" : "PRODUCTION"}`
    )}`
  );
  console.log("");
  await inquirer
    .prompt([
      {
        type: "confirm",
        name: "shouldSwitch",
        message: `Would you like to switch to ${chalk.blue(
          `${!isDev ? "DEVELOPER" : "PRODUCTION"}`
        )}?`,
        default: true
      }
    ])
    .then(answer => {
      if (answer.shouldSwitch)
        switchContext()
          .then(res => {
            console.log(
              boxen(`Context switched to ${chalk.blue(res)}`, {
                ...BOXEN_OPTS,
                ...{
                  borderColor: "blue"
                }
              })
            );
            console.log(`   ${chalk.green("✔ ")} Switch successful!`);
            endMessage(true);
          })
          .catch(err => {
            console.log(
              `${chalk.red(
                "✘ "
              )} Something went wrong! Double-check your ${chalk.green(
                "manifest.xml"
              )} file.`
            );
            return null;
          });
      else {
        console.log("");
        console.log(`   All right! No changes have been made.`);
        endMessage();
      }
    })
    .catch(err => {
      console.log("Closing...");
    });

  return "";
};

async function getCurrentContext() {
  return new Promise((resolve, reject) => {
    const xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
    const isDev = /\<\!\--\s\<MainPath\>\.\/dist\/(spa\/)?index\.html\<\/MainPath\>\s\-\-\>/;
    const isBuild = /\<\!\--\s\<MainPath\>\.\/(src|public)\/index\-dev\.html\<\/MainPath\>\s\-\-\>/;
    resolve(isDev.test(xml));
  });
}

function switchContext() {
  return new Promise((resolve, reject) => {
    let xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
    const isDev = /\<\!\--\s\<MainPath\>\.\/dist\/spa\/index\.html\<\/MainPath\>\s\-\-\>/gm;
    const isBuild = /\<\!\--\s\<MainPath\>\.\/src\/index\-dev\.html\<\/MainPath\>\s\-\-\>/gm;
    const isDevVanilla = /\<MainPath\>\.\/dist\/spa\/index\.html\<\/MainPath\>/gm;
    const isBuildVanilla = /\<MainPath\>\.\/src\/index\-dev\.html\<\/MainPath\>/gm;
    const devString = `<MainPath>./src/index-dev.html</MainPath>`;
    const buildString = `<MainPath>./dist/spa/index.html</MainPath>`;
    const commentedDevString = `<!-- <MainPath>./src/index-dev.html</MainPath> -->`;
    const commentedBuildString = `<!-- <MainPath>./dist/spa/index.html</MainPath> -->`;
    if (isDev.test(xml)) {
      xml = xml.replace(isDev, buildString);
      xml = xml.replace(isBuildVanilla, commentedDevString);
      fs.writeFileSync(`./CSXS/manifest.xml`, xml);
      resolve("PRODUCTION");
    } else if (isBuild.test(xml)) {
      xml = xml.replace(isBuild, devString);
      xml = xml.replace(isDevVanilla, commentedBuildString);
      fs.writeFileSync(`./CSXS/manifest.xml`, xml);
      resolve("DEVELOPER");
    } else {
      reject("Something went wrong with RegEx matching.");
    }
  });
}
