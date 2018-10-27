const child_process = require("child_process");
const fs = require("fs");

function dockerComposeDown() {
  try {
    child_process.execSync("docker-compose -f docker-compose.yml down");
  } catch(err) {
    // Do nothing
  }
}

// Display the logs
let logArgs = ["-f", "docker-compose.yml", "logs", "-f"];

if(process.argv.length > 2) {
  logArgs.push(process.argv[2]);
}

child_process.spawn("docker-compose", logArgs, {
  stdio: ["ignore", "inherit", "inherit"]
});

process.on("SIGINT", dockerComposeDown);

// wait for result to be written to runner-result
let timer;
fs.watch("runner-result/runner-result", () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    let status = +fs.readFileSync("runner-result/runner-result", "utf8");

    dockerComposeDown();
    fs.unlinkSync("runner-result/runner-result");
    fs.rmdirSync("runner-result");

    process.exit(status);
  }, 500);
});