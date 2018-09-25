const child_process = require("child_process");

// Wait for the tests container to exit
function awaitTestExit() {
  let tests = child_process.spawn("docker-compose",
    ["-f", "docker-compose.test.yml", "logs", "-f", "tests"], {
      stdio: ["ignore", "pipe", "pipe"]
    });
  
  return new Promise((resolve) => {
    tests.on("exit", resolve);
  });
}

const MYSQL_UP_MSG = "socket: '/var/run/mysqld/mysqld.sock'  port: 3306";

// Start mysql
function mysqlUp() {
  let mysql = child_process.spawn("docker-compose",
    ["-f", "docker-compose.test.yml", "up"], {
      stdio: ["ignore", "pipe", "pipe"]
    });
  
  mysql.stdout.setEncoding("utf8");

  return new Promise((resolve, reject) => {
    mysql.stdout.on("data", (data) => {
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

function dockerComposeDown() {
  try {
    child_process.execSync("docker-compose -f docker-compose.test.yml down");
  } catch(err) {
    // do nothing
  }
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

async function run() {
  await Promise.all([
    dockerComposeBuild(),
    mysqlUp()
  ]);

  dockerComposeUp();
  await sleep(3000);
  let status = await awaitTestExit();

  dockerComposeDown();
  process.exit(status);
}

run();

process.on("SIGINT", dockerComposeDown);