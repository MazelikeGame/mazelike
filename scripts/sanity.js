/* eslint-disable */
const moment = require("moment");
const chalk = require("chalk");
const fs = require("fs");

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

let verbose = false;
let noJson = false;
let logPath;
let minLevel = 0;
let filter = () => true;
let reqIds = new Set();

for(let i = 2; i < process.argv.length; ++i) {
  switch(process.argv[i]) {
  case "-f":
    filter = new Function(`return (${process.argv[++i]});`);
    break;
  
  case "-v":
    verbose = true;
    break;
  
  case "-0":
    noJson = true;
    break;
  
  case "-l":
    let level = process.argv[++i];
    minLevel = +Object.keys(LEVELS).find(l => LEVELS[l] == level);
    break;
  
  case "-h":
    console.log("node scripts/sanity.js [log file path]");
    console.log("-f <filter expr>  An expression to evaluate against logs (this = log object)");
    console.log("-v                Print all json fileds (don't ignore keys in IN_MESSAGE_VARS)");
    console.log("-0                Don't print any json fileds");
    console.log("-l <level>        Only print logs at or above the log level");
    console.log("-req <req_id>     Only print logs from the request or requests by the coma separated req_ids");
    process.exit(0);
    break;
  
  case "-req":
    reqIds = new Set(process.argv[++i].split(",").map(n => +n));
    break;
  
  default:
    logPath = process.argv[i];
    break;
  }
} 

if(logPath) {
  processStream(fs.createReadStream(logPath));
} else {
  processStream(process.stdin);
}

function processStream(stream) {
  let buffer = "";

  stream.setEncoding("utf8");
  stream.on("data", (raw) => {
    buffer += raw;

    let lines = buffer.split(/\r?\n/);
    
    buffer = lines.pop();

    lines.forEach(processLog);
  });

  stream.on("end", () => {
    let lines = buffer.split(/\r?\n/);
    lines.pop();
    lines.forEach(processLog);
  });
}

function processLog(lo) {
  lo = JSON.parse(lo);

  if(!filter.call(lo) || minLevel > lo.level || (lo.req_id && reqIds.size !== 0 && !reqIds.has(lo.req_id))) {
    return;
  }

  let keys;
  
  if(noJson) {
    keys = [];
  } else {
    keys = Object.keys(lo).filter(k => !SKIP_PROPS.has(k) && (!IN_MESSAGE_VARS.has(k) || verbose));
  }
  
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
  let shortProps = "";

  if(inline.length) {
    shortProps = chalk.blue(`(${inline.map(k => `${k}=${lo[k]}`).join(", ")})`);
  }

  console.log(timestamp, COLORS[lo.level](LEVELS[lo.level]), lo.msg, shortProps);
  
  keys.forEach((k, i) => {
    if(i > 0) console.log("---");
    console.log(`${k} ${JSON.stringify(lo[k], null, 2)}`);
  });
}