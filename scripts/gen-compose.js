/* eslint-disable */
const Handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const DOCKER_PATH = path.join(__dirname, "..");
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
    suffix: opts.suffix || "",
    version: opts.version,
    env_file: opts.env_file,
    backend_port: opts.backend_port,
    backend_volume: !opts.test,
    test: opts.test,
    def_vol: !opts.test || opts.sql,
    docker_sock: opts.docker_cluster
  };

  config.volumes = config.backend_volume || config.docker_sock;

  let backend_env = {};
  let sql_env = {
    MYSQL_DATABASE: "mazelike"
  };

  if(config.prefix) {
    backend_env.CONTAINER_PREFIX = config.prefix;
  }

  if(config.docker_sock) {
    backend_env.CLUSTER_MANAGER = "docker";
  }

  if(opts.test) {
    backend_env.DB_STORAGE = ":memory:";
  } else if(!opts.extern_db) {
    backend_env.DB_STORAGE = "/data/mazelike.sqlite";
  }

  Object.assign(backend_env, opts.backend_env);
  config.backend_env = makeEnv(backend_env);
  config.sql_env = makeEnv(sql_env);

  return config;
}

// parse command line args
let opts = {
  backend_env: {}
};

for(let i = 2; i < process.argv.length; ++i) {
  if(process.argv[i][0] === "-") {
    if(!process.argv[i + 1] || process.argv[i + 1][0] === "-") {
      opts[process.argv[i].substr(1)] = true;
    } else if(process.argv[i].substr(0, 2) == "-e") {
      opts.backend_env[process.argv[i].substr(2)] = process.argv[i + 1];
    } else {
      opts[process.argv[i].substr(1)] = process.argv[++i];
    }
  }
}

if(opts.help) {
  console.log(`Usage: gen-compose [options] <build_name>

suffix             The suffix to add to all containers, volumes, and networks
version            The version for the images
env_file           Use env file
backend_port       The external port for the backend
test               Include the test container
docker_cluster     Use the docker cluster manager
-e*                Custom backend env config
extern_db          Don't fallback on sqlite`);
  process.exit(0);
}

build("docker-compose.tmpl.yml", "docker-compose.yml", makeComposeConf(opts));