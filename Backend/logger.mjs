/* eslint-disable arrow-body-style */
import winston from "winston";
import chalk from "chalk";
import moment from "moment";
import fs from "fs";
import path from "path";

let logFile = process.env.LOG_FILE || "mazelike.log";

// Empty the log
if(path.relative(process.cwd(), process.argv[1]) === "Backend/index.mjs") {
  fs.writeFileSync(logFile, "");
}

let noop = (msg) => msg;

function formatter(colors) {
  const LEVELS = {
    error: colors.red,
    warn: colors.yellow,
    info: colors.cyan,
    verbose: colors.magenta,
    debug: colors.magenta,
    silly: colors.green
  };

  return winston.format.printf((info) => {
    let timestamp = moment().format("hh:mm:ss");
    let levelFn = LEVELS[info.level] || noop;
    let blueFn = colors.blue || noop;

    return `${blueFn(timestamp)} ${levelFn(info.level.toUpperCase())} - ${info.message}`;
  });
}

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: "info",
      format: formatter(chalk),
    }),
    new winston.transports.File({
      level: "silly",
      format: formatter({}),
      filename: logFile
    })
  ]
});

// NOTE: I use a global because dynamic import is not supported in node 8.11
global.ml || (global.ml = {}); // eslint-disable-line
global.ml.logger = logger;