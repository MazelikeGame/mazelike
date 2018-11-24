/* eslint-disable arrow-body-style */
const winston = require("winston");
const chalk = require("chalk");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

let logFile = process.env.LOG_FILE || "mazelike.log";
// Filter out tags
let onlyTags = new Set((process.env.LOG_ONLY || "").split(/\s*,\s*/).filter(t => t));
let excludeTags = new Set((process.env.LOG_EXCLUDE || "").split(/\s*,\s*/).filter(t => t));

// Empty the log
if(path.relative(process.cwd(), process.argv[1]) === "Backend/index.mjs") {
  fs.writeFileSync(logFile, "");
}

let noop = (msg) => msg;
let arrayify = (obj) => {
  if(!obj) return [];

  return Array.isArray(obj) ? obj : [obj];
};

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
    let tags = arrayify(info.tags);
    let tagsStr = info.tags ? `[${tags.join(", ")}] ` : "";


    return `${blueFn(timestamp)} ${tagsStr}${levelFn(info.level.toUpperCase())} - ${info.message}`;
  });
}

let filter = winston.format(function(info) {
  let tags = arrayify(info.tags);
  return (onlyTags.size === 0 || tags.find((t) => onlyTags.has(t))) && !tags.find((t) => excludeTags.has(t)) ? info : false;
});

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        filter(),
        formatter(chalk)
      ),
    }),
    new winston.transports.File({
      level: process.env.LOG_FILE_LEVEL || "silly",
      format: formatter({}),
      filename: logFile
    })
  ]
});

// NOTE: I use a global because dynamic import is not supported in node 8.11
global.ml || (global.ml = {}); // eslint-disable-line
global.ml.logger = logger;