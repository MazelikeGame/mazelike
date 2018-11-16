/* eslint-disable */
const {spawn} = require("child_process");
const os = require("os");
const fs = require("fs");

// The mazelike logo
let logo = [
  "___  ___                  _  _  _         ",
  "|  \\/  |                 | |(_)| |        ",
  "| .  . |  __ _  ____ ___ | | _ | | __ ___ ",
  "| |\\/| | / _` ||_  // _ \\| || || |/ // _ \\",
  "| |  | || (_| | / /|  __/| || ||   <|  __/",
  "\\_|  |_/ \\__,_|/___|\\___||_||_||_|\\_\\___|",
  ""
];

logo = logo.join(os.platform() === "win32" ? "\r\n" : "\n");

// Run a command and kill this script if the command fails
let exec = (command, ...args) => {
  let child = spawn(command, args, {
    stdio: ["inherit", "inherit", "inherit"],
    env: process.env
  });

  return new Promise((resolve) => {
    child.on("exit", (code) => {
      if(code !== 0) {
        process.exit(code);
      }

      resolve();
    });
  });
};

(async() => {
  // Allow users to run sh
  if(process.argv[2] == "sh") {
    await exec(os.platform() === "win32" ? "cmd" : "/bin/sh");
    process.exit(0);
  }

  // Run a game server
  if(process.argv[2] == "game") {
    await exec("node --experimental-modules Backend/game.mjs");
    process.exit(0);
  }

  process.env.DB_DEBUG = "no";

  // Parse command line arguments
  for(let i = 2; i < process.argv.length; ++i) {
    switch(process.argv[i]) {
      case "-h":
      case "--help":
        console.log(`Usage: mazelike [options]

  sh               Start ${os.platform() === "win32" ? "cmd" : "ash"} for debugging
  -h, --help       Show this message
  -v, --verbose    Print all database queries
  -d, --docker     Run the game server instances as separate containers
  --version        Print the current version
  -t, --tag <tag>  The tag to use for spawning game servers (automatically sets -d)
                      ex: ryan3r/mazelike`);
        return;

      case "-v":
      case "--verbose":
        process.env.DB_DEBUG = "yes";
        break;
      
      case "-d":
      case "--docker":
        process.env.CLUSTER_MANAGER = "docker";
        break;
      
      case "--version":
      case "cat": // for backwards compatability
        console.log(fs.readFileSync("VERSION", "utf8").trim());
        process.exit(0);
        break;
      
      case "-t":
      case "--tag":
        process.env.CLUSTER_MANAGER = "docker";
        process.env.IMAGE_NAME = process.argv[++i];

        if(i === process.argv.length || process.env.IMAGE_NAME[0] === "-") {
          console.log(`Expected docker image/tag but got ${process.env.IMAGE_NAME}`);
          process.exit(0);
        }
        break;
      
      default:
        console.log(`Unknown argument ${process.argv[i]}`);
        break;
    }
  }

  // Set docker defaults
  if(!process.env.CLUSTER_MANAGER) {
    process.env.CLUSTER_MANAGER = "single";
  }

  if(process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
  }

  if(!process.env.DB) {
    process.env.DB = "sqlite:///data/mazelike.sqlite";
  }

  if(!process.env.PUBLIC_DIR) {
    process.env.PUBLIC_DIR = "/data";
  }

  console.log(logo);

  await exec("./node_modules/.bin/sequelize", "db:migrate");
  await exec("node", "--experimental-modules", "Backend/index.mjs");
})();