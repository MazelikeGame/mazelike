/* eslint-disable arrow-body-style */
global.ml = {
  noCreateLogger: true
};

let winston = require("winston");

// Don't wrap the formatters in winton's formats
winston.format = (a) => a;
winston.format.printf = (a) => a;

// Parse args
for(let i = 2; i < process.argv.length; ++i) {
  switch(process.argv[i]) {
  case "-o":
  case "--only":
    process.env.LOG_ONLY = process.argv[++i];
    break;
  
  case "-e":
  case "--exclude":
    process.env.LOG_EXCLUDE = process.argv[++i];
    break;
  
  case "-h":
  case "--help":
    // eslint-disable-next-line
    console.log("Usage: node scripts/log-parser [-o <only tags>] [-e <exclude tags>] [log file]");
    process.exit(0);
    break;

  default:
    process.env.LOG_FILE = process.argv[i];
    break;
  }
}

const logger = require("../Backend/logger");
const fs = require("fs");

// Process the stream
let stream = process.env.LOG_FILE ? fs.createReadStream(process.env.LOG_FILE) : process.stdin;
let buffer = "";

stream.setEncoding("utf8");
stream.on("data", (raw) => {
  buffer += raw;

  let lines = buffer.split(/\r?\n/);

  // wait for the rest of this line
  buffer = lines.pop();

  lines.forEach(processLog);
});

stream.on("end", () => {
  let lines = buffer.split(/\r?\n/);

  // remove the trailing new line
  lines.pop();
  lines.forEach(processLog);
});

let format = logger.formatter(require("chalk"));

// Process a single line of the log file
function processLog(rawLog) {
  let log = JSON.parse(rawLog);

  if(logger.filter(log)) {
    console.log(format(log)); // eslint-disable-line
  }
}