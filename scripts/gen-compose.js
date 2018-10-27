/* eslint-disable */
const Handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const DOCKER_PATH = path.join(__dirname, "../docker");
const TAB = "  ";
const ENV_TAB_LEVEL = 3;

function build(tmpl, out, params) {
  let template = Handlebars.compile(fs.readFileSync(`${DOCKER_PATH}/${tmpl}`, "utf8"));
  let file = template(params);
  fs.writeFileSync(`${DOCKER_PATH}/${out}`, file);
}

function makeEnv(env) {
  let rawEnv = "";
  let first = true;
  // generate the tab
  let tab = "";
  for(let i = 0; i < ENV_TAB_LEVEL; ++i) {
    tab += TAB;
  }

  // build the env pairs
  for(let key of Object.keys(env)) {
    rawEnv += `${first ? "" : tab}${key}: "${env[key]}"\n`;
    first = false; // the first one is already indented
  }

  return rawEnv.substr(0, rawEnv.length - 1);
}

function makeComposeConf(opts) {
  let config = {
    build_name: opts.build_name,
    suffix: opts.suffix || "",
    version: opts.version,
    env_file: opts.env_file,
    env_path: opts.env_file === true ? "" : opts.env_file,
    backend_port: opts.backend_port,
    backend_volume: !opts.test,
    test: opts.test,
    sql: opts.sql,
    def_vol: !opts.test || opts.sql
  };

  let backend_env = {};
  let sql_env = {
    MYSQL_DATABASE: "mazelike"
  };

  // use sql as the database
  if(opts.sql) {
    backend_env = {
      DB_HOST: "sql",
      DB_PORT: 3306,
      DB_USER: "root",
      DB_DATABASE: "mazelike"
    };

    // configure a random password if no env file is given
    if(!opts.env_file) {
      // NOTE: Password is weak it will only slightly deter/slow down hackers
      // use an env file for security critical applications
      let password = Math.floor(Math.random() * 10 ** 10).toString(16);
      backend_env.DB_PASS = password;
      sql_env.MYSQL_ROOT_PASSWORD = password;
    }
  } else if(opts.test) {
    backend_env.DB_STORAGE = ":memory:";
  } else {
    backend_env.DB_STORAGE = "/data/mazelike.sqlite";
  }

  config.backend_env = makeEnv(backend_env);
  config.sql_env = makeEnv(sql_env);

  return config;
}

// parse command line args
let opts = {};
for(let i = 2; i < process.argv.length; ++i) {
  if(process.argv[i][0] === "-") {
    if(!process.argv[i + 1] || process.argv[i + 1][0] === "-") {
      opts[process.argv[i].substr(1)] = true;
    } else {
      opts[process.argv[i].substr(1)] = process.argv[++i];
    }
  } else {
    opts.build_name = process.argv[i];
  }
}

if(opts.help) {
  console.log(`Usage: gen-compose [options] <build_name>

suffix           The suffix to add to all containers, volumes, and networks
version          The version for the images
env_file         Use env files (also can be the path for the env files)
backend_port     The external port for the backend
test             Include the test container
sql              Include and use a mysql container`);
  process.exit(0);
}

build("tmpl/docker-compose.yml", `../docker-compose.yml`, makeComposeConf(opts));