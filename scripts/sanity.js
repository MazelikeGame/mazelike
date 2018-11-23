/* eslint-disable */
const moment = require("moment");
const chalk = require("chalk");

// Properties to skip
const SKIP_PROPS = new Set([
  "pid",
  "name",
  "hostname",
  "level",
  "v",
  "time",
  "msg"
]);

const COLORS = {
  60: chalk.red,
  50: chalk.red,
  40: chalk.yellow,
  30: chalk.cyan,
  20: chalk.green,
  10: chalk.green
};

const LEVELS = {
  60: "fatal",
  50: "error",
  40: "warn",
  30: "info",
  20: "debug",
  10: "trace"
};

const IN_MESSAGE_VARS = new Set([
  "method",
  "status",
  "res_time",
  "url"
]);

const VERBOSE = false;

let log = require("fs").readFileSync("data/logs/mazelike.log", "utf8");

log = log.trim().replace(/\r?\n/g, ",");
log = JSON.parse(`[${log}]`);

for(let lo of log) {
  let keys = Object.keys(lo)
    .filter(k => !SKIP_PROPS.has(k) && (!IN_MESSAGE_VARS.has(k) || VERBOSE));
  
  let numShort = 3;
  let shiftIdx = 0;
  let inline = [];
  while(numShort-- > 0 && shiftIdx < keys.length) {
    let value = lo[keys[shiftIdx]];
    if(typeof value === "object" || (typeof value == "string" && value.length > 50)) {
      ++shiftIdx;
      continue;
    }

    inline.push(keys[shiftIdx]);
    keys.splice(shiftIdx, 1);
  }

  for(let i = 0; i < keys.length; ++i) {
    if(Object.keys(lo[keys[i]]).length === 0) {
      keys.splice(i, 1);
      --i;
    }
  }

  let timestamp = chalk.magenta(moment(lo.time).format("hh:mm:ss"));
  let shortProps = chalk.blue(`(${inline.map(k => `${k}=${lo[k]}`).join(", ")})`);
  console.log(timestamp, COLORS[lo.level](LEVELS[lo.level]), lo.msg, shortProps);
  
  keys.forEach(k => console.log(`${k} ${JSON.stringify(lo[k], null, 2)}`));
}