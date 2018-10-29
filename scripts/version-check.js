// Verify that the version has changed
/* eslint-disable */
const {execSync} = require("child_process");

let image;

try {
  image = execSync("docker inspect mazelike --format \"{{.Config.Image}}\"").toString();
} catch(err) {
  console.log(`Docker error: ${err.message}`);
  process.exit(0);
}

let oldVersion = image.match(/(\d+)\.(\d+)\.(\d+)/);
let versionStr = require("../package.json").version;
let version = versionStr.match(/(\d+)\.(\d+)\.(\d+)/);

if(!oldVersion || !version) {
  throw new Error(`Failed to parse version (${oldVersion ? versionStr : image})`);
}

let isNewer = 
  (+oldVersion[1] < +version[1]) || // new major
  (+oldVersion[2] === +version[2] && +oldVersion[2] < +version[2]) || // new minor
  (+oldVersion[2] === +version[2] && +oldVersion[2] === +version[2] && +oldVersion[3] < +version[3]); // new patch

if(!isNewer) {
  console.log(`Version ${version[0]} is not newer than ${oldVersion[0]}`);
  process.exit(1);
}