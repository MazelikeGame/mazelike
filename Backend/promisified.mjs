import fs from "fs";
import util from "util";

// Make a promise firendly version of fs methods
export let fsp = {};

// Add the name of any fs function you want to use here (alphebetical order)
const FS_METHODS = [
  "readdir",
  "readFile",
  "writeFile",
];

for(const method of FS_METHODS) {
  fsp[method] = util.promisify(fs[method]);
}