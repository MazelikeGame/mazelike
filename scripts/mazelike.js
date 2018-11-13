/* eslint-disable */
const {spawn} = require("child_process");
const os = require("os");

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
    await exec("/bin/sh");
    process.exit(0);
  }

  if(process.argv[2] == "cmd") {
    await exec("cmd.exe");
    process.exit(0);
  }

  process.env.DB_DEBUG = "no";

  // Parse command line arguments
  for(let i = 2; i < process.argv.length; ++i) {
    switch(process.argv[i]) {
      case "-h":
      case "--help":
        console.log(`Usage: mazelike [options]

    -h, --help     Show this message
    -v, --verbose  Print all database queries
    -d, --docker   Run the game server instances as separate containers
  `);
        return;

      case "-v":
      case "--verbose":
        process.env.DB_DEBUG = "yes";
        break;
      
      case "-d":
      case "--docker":
        process.env.CLUSTER_MANAGER = "docker";
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

  if(!process.env.DB_HOST && !process.env.DB_STORAGE) {
    process.env.DB_STORAGE = "/data/mazelike.sqlite";
  }

  if(!process.env.PUBLIC_DIR) {
    process.env.PUBLIC_DIR = "/data";
  }

  console.log(logo);

  // Only run migrations when we are not running sqlite
  if(!process.env.DB_STORAGE) {
    await exec("./node_modules/.bin/sequelize", "db:migrate");
  }

  await exec("node", "--experimental-modules", "Backend/index.mjs");
})();