const child_process = require("child_process");

const EXIT_STATUS = /tests_\d+ exited with code (\d+)/;

// Wait for the tests container to exit
function awaitTestExit() {
  let tests = child_process.spawn("docker-compose",
    ["-f", "docker-compose.test.yml", "logs", "-f", "tests"], {
      stdio: ["ignore", "pipe", "pipe"]
    });
  
  tests.stdout.setEncoding("utf8");
  
  return new Promise((resolve) => {
    tests.stdout.on("data", (line) => {
      let match = line.match(EXIT_STATUS);
      if(match) {
        resolve(+match[1]);
      }
    });
  });
}

const MYSQL_UP_MSG = "socket: '/var/run/mysqld/mysqld.sock'  port: 3306";

// Start mysql
function mysqlUp() {
  let mysql = child_process.spawn("docker-compose",
    ["-f", "docker-compose.test.yml", "up", "mysql"], {
      stdio: ["ignore", "pipe", "inherit"]
    });
  
  mysql.stdout.setEncoding("utf8");

  return new Promise((resolve, reject) => {
    mysql.stdout.on("data", (data) => {
      process.stdout.write(data);

      if(data.indexOf(MYSQL_UP_MSG) !== -1) {
        mysql.stdout.removeAllListeners("data");

        resolve();
      }
    });

    mysql.stdout.on("end", reject);
  });
}

// Start all the services
function dockerComposeUp() {
  child_process.spawn("docker-compose",
    ["-f", "docker-compose.test.yml", "up", "backend", "tests"], {
      stdio: ["ignore", "inherit", "inherit"]
    });
}

// Build all the services
function dockerComposeBuild() {
  let build = child_process.spawn("docker-compose",
    ["-f", "docker-compose.test.yml", "build"], {
      stdio: ["ignore", "inherit", "inherit"]
    });
  
  return new Promise((resolve) => {
    build.on("exit", resolve);
  });
}

function dockerComposeDown(count) {
  try {
    child_process.execSync("docker-compose -f docker-compose.test.yml down");
  } catch(err) {
    if(count) {
      dockerComposeDown(count - 1);
    }
  }
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

async function run() {
  let startTime = Date.now();
  dockerComposeDown(1);

  await Promise.all([
    dockerComposeBuild(),
    mysqlUp()
  ]);

  dockerComposeUp();
  await sleep(7000);
  let status = await awaitTestExit();

  dockerComposeDown(2);
  /* eslint-disable no-console */
  console.log(`Runtime ${(Date.now() - startTime) / 1000}s`);
  /* eslint-enable no-console */
  process.exit(status);
}

run();

process.on("SIGINT", dockerComposeDown);