const child_process = require("child_process");
const fs = require("fs");

function dockerComposeDown() {
  try {
    child_process.execSync("docker-compose stop tests");
  } catch(err) {
    // Do nothing
  }
}

// Display the logs
let logArgs = ["logs", "-f"];

if(process.argv.length > 2) {
  logArgs.push(process.argv[2]);
}

child_process.spawn("docker-compose", logArgs, {
  stdio: ["ignore", "inherit", "inherit"]
});

process.on("SIGINT", dockerComposeDown);

// wait for result to be written to runner-result
let timer;
fs.watch("runner-result", () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    quit();
  }, 500);
});

quit();

function quit() {
  let status = +fs.readFileSync("runner-result", "utf8");

  if(isNaN(status)) {
    return;
  }

  dockerComposeDown();
  fs.unlinkSync("runner-result");

  process.exit(status);
}