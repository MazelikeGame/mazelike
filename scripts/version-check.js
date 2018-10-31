// Verify that the version has changed
/* eslint-disable */
const {execSync} = require("child_process");
const fs = require("fs");

let image;

try {
  image = execSync(`docker exec mazelike cat VERSION`).toString().trim();
} catch(err) {
  console.log(`Docker error: ${err.message}`);
  process.exit(0);
}

let oldVersion = image.match(/(\d+)\.(\d+)\.(\d+)/);
let versionStr = fs.readFileSync("VERSION", "utf8").trim();
let version = versionStr.match(/(\d+)\.(\d+)\.(\d+)/);

if(!oldVersion || !version) {
  throw new Error(`Failed to parse version (${oldVersion ? versionStr : image})`);
}

let isNewer = 
  (+oldVersion[1] < +version[1]) || // new major
  (+oldVersion[1] === +version[1] && +oldVersion[2] < +version[2]) || // new minor
  (+oldVersion[1] === +version[1] && +oldVersion[2] === +version[2] && +oldVersion[3] < +version[3]); // new patch

if(!isNewer) {
  console.log(`Version ${version[0]} is not newer than ${oldVersion[0]}`);
  process.exit(1);
}