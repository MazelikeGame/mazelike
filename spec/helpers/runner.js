/* global beforeAll afterAll jasmine */
const child_process = require("child_process");
const {Buffer} = require("buffer");

const TEST_TIMEOUT = 15 * 1000; // 15 seconds

/**
 * Create a single buffer from a stream
 * 
 * @param {Stream[]} streams
 * @return Promise<Buffer>
 */
function collect(streams) {
  let promises = [];
  let buffer = Buffer.alloc(0);

  for(let stream of streams) {
    promises.push(
      new Promise((resolve, reject) => {
        stream.on("error", reject);

        stream.on("data", (data) => {
          buffer = Buffer.concat([buffer, data], buffer.length + data.length);
        });

        stream.on("end", () => {
          resolve();
        });
      })
    );
  }

  return Promise.all(promises)
    .then(() => {
      return buffer;
    });
}

/**
 * Run docker-compose build as a child process and print the stderr if it fails
 * 
 * @return Promise
 */
async function composeBuild() {
  return new Promise((resolve, reject) => {
    let child = child_process.spawn("docker-compose", ["build"], {
      stdio: ["ignore", "pipe", "pipe"]
    });

    // collect and errors printed by docker-compose
    let stdio = collect([child.stdout, child.stderr]);

    // wait for docker-compose to exit
    child.on("close", async(code) => {
      if(code !== 0) {
        // Something went wrong
        reject(new Error(`docker-compose build: ${(await stdio).toString()}`));
      } else {
        resolve();
      }
    });
  });
}

// the text displayed when each server is ready
const MYSQL_READY_MSG = "port: 3306  MySQL";
const BACKEND_READY_MSG = "Server started on port 3000";

/**
 * Scan stdout for the logs indicating that mysql and the backend are up and running.
 * The messages are defined in MYSQL_READY_MSG and BACKEND_READY_MSG.
 * 
 * @param {Stream} stdout
 * @return Promise
 */
function waitForReady(stdout) {
  return new Promise((resolve, reject) => {
    let backendReady = false;
    let mysqlReady = false;

    let dataHandler = (bufData) => {
      let data = bufData.toString();

      // check for ready messages
      mysqlReady = mysqlReady || data.indexOf(MYSQL_READY_MSG) !== -1;
      backendReady = backendReady || data.indexOf(BACKEND_READY_MSG) !== -1;

      // check if both are ready
      if(mysqlReady && backendReady) {
        stdout.removeListener("data", dataHandler);
        stdout.removeListener("end", endHandler);

        resolve();
      }
    };

    let endHandler = () => {
      // if the stream ends and either one is not ready throw an error
      if(!mysqlReady || !backendReady) {
        let service = !backendReady ? "The backend" : "MySQL";

        reject(new Error(`${service} was not ready in time`));
      }
    };

    stdout.on("data", dataHandler);
    stdout.on("end", endHandler);
  });
}

/**
 * Return a promise for the next time an event is fired (like EventEmitter.once)
 * 
 * @param {EventEmitter} emitter
 * @param {string} eventName
 * @return Promise
 */
function once(emitter, eventName) {
  return new Promise((resolve) => {
    emitter.once(eventName, resolve);
  });
}

/**
 * Run the docker-compose down command.
 * 
 * @return Promise
 */
function dockerDown() {
  return new Promise((resolve) => {
    child_process.exec("docker-compose down", resolve);
  });
}

/**
 * Run docker-compose up and wait for MySQL and the backend to be ready.
 * Returns a promise to the stderr and stdout of docker-compose up.
 * 
 * @returns Promise
 */
async function startServer() {
  let child = child_process.spawn("docker-compose", ["up"], {
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stdio = collect([child.stdout, child.stderr]);

  await Promise.race([
    // Wait for an error from starting the child or ...
    once(child, "error")
      .then((err) => {
        return Promise.reject(err);
      }),

    // Throw an error if data is written to stderr or ...
    once(child.stderr, "data")
      .then(async() => {
        // make sure docker stops
        setTimeout(dockerDown, 500);

        throw new Error(`Data written to stderr: ${(await stdio).toString()}`);
      }),

    // Wait for all services to be ready
    waitForReady(child.stdout)

      // Add stderr to the error message from waitForReady
      .catch(async(err) => {
        throw new Error(`${err.message} stderr: ${(await stdio).toString()}`);
      })
  ]);

  // This must be passed in an object otherwise
  // the function will wait for it to resolve
  return {stdio};
}

// Don't time out if this takes a while
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Start the server and wait for it to start listening
beforeAll(async function(done) {
  try {
    await composeBuild();

    let {stdio} = await startServer();

    this.__stdio__ = stdio;

    jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_TIMEOUT;

    done();
  } catch(err) {
    done(err);
  }
});

// Stop the server before we exit
process.on("exit", () => {
  dockerDown();
});

afterAll((done) => {
  dockerDown().then(done);
});