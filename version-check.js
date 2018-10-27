// Verify that the version has changed
/* eslint-disable */
const {execSync} = require("child_process");

let image;

try {
  image = execSync("docker inspect mazelike --format \"{{.Config.Image}}\"").toString();
} catch(err) {
  console.log(`Docker error: ${err.message}`);
}

let oldVersion = image.match(/(\d+)\.(\d+)\.(\d+)/);
let version = require("./package.json").version.match(/(\d+)\.(\d+)\.(\d+)/);

if(!oldVersion || !version) {
  throw new Error("Failed to parse version");
}

let isNewer = 
  (+oldVersion[1] < +version[1]) || // new major
  (+oldVersion[2] === +version[2] && +oldVersion[2] < +version[2]) || // new minor
  (+oldVersion[2] === +version[2] && +oldVersion[2] === +version[2] && +oldVersion[3] < +version[3]); // new patch

if(!isNewer) {
  console.log(`Version ${oldVersion[0]} is not newer than ${version[0]}`);
  process.exit(1);
}