require('dotenv').config();
const url = require("url");
const os = require("os");

let conf = {
  operatorsAliases: false,
  // eslint-disable-next-line
  logging: process.env.DB_DEBUG !== "no" ? console.log : false
};

// default to sqlite
if(!process.env.DB) {
  process.env.DB = "sqlite:///data/mazelike.sqlite";
}

let dbUrl;

try {
  dbUrl = url.parse(process.env.DB);
} catch(err) {
  process.stderr.write("The DB environment variable is not a valid url\n");
  process.exit(1);
}

let auth;
switch(dbUrl.protocol) {
// install tedious@^1.7.0 and add case "mssql:": to a mysql support
case "mysql:":
  conf.dialect = dbUrl.protocol.substr(0, dbUrl.protocol.length - 1);

  auth = dbUrl.auth && dbUrl.auth.split(":");
  conf.username = auth[0];
  conf.password = auth[1];

  conf.host = dbUrl.hostname;
  conf.port = +dbUrl.port || 3306;
  conf.database = dbUrl.pathname && dbUrl.pathname.substr(1);

  // validate what we got
  if(!conf.username) {
    process.stderr.write("Username missing\n");
    process.exit(0);
  }

  if(!conf.database) {
    process.stderr.write("Database missing\n");
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
  process.stderr.write(`Unknown protocol ${dbUrl.protocol.substr(0, dbUrl.protocol.length - 1)}\n`);
  break;
}

module.exports = {
  development: conf,
  test: conf,
  production: conf
};
