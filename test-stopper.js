const child_process = require("child_process");
const fs = require("fs");

function dockerComposeDown() {
  try {
    child_process.execSync("docker-compose -f docker-compose.test.yml down");
  } catch(err) {
    // Do nothing
  }
}

// Display the logs
child_process.spawn("docker-compose", ["-f", "docker-compose.test.yml", "logs", "-f"], {
  stdio: ["ignore", "inherit", "inherit"]
});

process.on("SIGINT", dockerComposeDown);

// wait for result to be written to runner-result
let timer;
fs.watch("runner-result", () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    let status = +fs.readFileSync("runner-result", "utf8");

    dockerComposeDown();
    fs.unlinkSync("runner-result");

    process.exit(status);
  }, 500);
});