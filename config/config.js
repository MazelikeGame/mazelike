/* global ml */
/* eslint-disable arrow-body-style */
require('dotenv').config();
require("../Backend/logger.js"); // THIS MUST BE THE FIRST IMPORT
const url = require("url");
const os = require("os");

let conf = {
  operatorsAliases: false,
  logging: (msg) => ml.logger.debug(msg, ml.tags("db"))
};

let dbUrl;

try {
  dbUrl = url.parse(process.env.DB);
} catch(err) {
  ml.logger.error("The DB environment variable is not a valid url", ml.tags("db"));
  process.exit(1);
}

let auth;
switch(dbUrl.protocol) {
// install tedious@^1.7.0 and add case "mssql:": to a mysql support
case "mysql:":
  conf.dialect = dbUrl.protocol.substr(0, dbUrl.protocol.length - 1);

  auth = dbUrl.auth && dbUrl.auth.split(":");
  conf.username = auth && auth[0];
  conf.password = auth && auth[1];

  conf.host = dbUrl.hostname;
  conf.port = +dbUrl.port || 3306;
  conf.database = dbUrl.pathname && dbUrl.pathname.substr(1);

  // validate what we got
  if(!conf.username) {
    ml.logger.error("Username missing", ml.tags("db"));
    process.exit(0);
  }

  if(!conf.database) {
    ml.logger.error("Database missing", ml.tags("db"));
    process.exit(0);
  }
  break;

case "sqlite:":
  conf.dialect = "sqlite";
  conf.storage = dbUrl.hostname + (dbUrl.pathname || "");

  // Convert to windows path
  if(os.platform() === "win32" && conf.storage[0] === "/") {
    conf.storage = conf.storage.substr(1);
    let startIdx = conf.storage.indexOf("/");
    
    let drive = conf.storage.substr(0, startIdx);
    let path = conf.storage.substr(startIdx);

    // no a single letter
    if(startIdx !== 1) {
      drive = "C";
      path = `\\${conf.storage}`;
    }

    conf.storage = `${drive}:${path}`.replace(/\//g, "\\");
  }
  break;

default:
  ml.logger.error(`Unknown protocol ${dbUrl.protocol.substr(0, dbUrl.protocol.length - 1)}`, ml.tags("db"));
  process.exit(0);
  break;
}

module.exports = {
  development: conf,
  test: conf,
  production: conf
};
