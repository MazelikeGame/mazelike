/* global beforeAll afterAll jasmine */
const child_process = require("child_process");
const {Buffer} = require("buffer");

/**
 * Create a single buffer from a stream
 * 
 * @param {Stream} stream
 * @return Promise<Buffer>
 */
function collect(stream) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0);

    stream.on("error", reject);

    stream.on("data", (data) => {
      buffer = Buffer.concat([buffer, data], buffer.length + data.length);
    });

    stream.on("end", () => {
      resolve(buffer);
    });
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
      stdio: ["ignore", "ignore", "pipe"]
    });

    // collect and errors printed by docker-compose
    let stderr = collect(child.stderr);

    // wait for docker-compose to exit
    child.on("close", async(code) => {
      if(code !== 0) {
        // Something went wrong
        reject(new Error(`docker-compose build: ${(await stderr).toString()}`));
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

    stdout.on("data", (bufData) => {
      let data = bufData.toString();

      // check for ready messages
      mysqlReady = mysqlReady || data.indexOf(MYSQL_READY_MSG) !== -1;
      backendReady = backendReady || data.indexOf(BACKEND_READY_MSG) !== -1;

      // check if both are ready
      if(mysqlReady && backendReady) {
        stdout.removeAllListeners("data");
        stdout.removeAllListeners("end");

        resolve();
      }
    });

    stdout.on("end", () => {
      // if the stream ends and either one is not ready throw an error
      if(!mysqlReady || !backendReady) {
        let service = !backendReady ? "The backend" : "MySQL";

        reject(new Error(`${service} was not ready in time`));
      }
    });
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

  let stderr = collect(child.stdout);

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

        throw new Error(`Data written to stderr: ${(await stderr).toString()}`);
      }),

    // Wait for all services to be ready
    waitForReady(child.stdout)

      // Add stderr to the error message from waitForReady
      .catch(async(err) => {
        throw new Error(`${err.message} stderr: ${(await stderr).toString()}`);
      })
  ]);

  let stdout = collect(child.stdout);

  return {stdout, stderr};
}

// Start the server and wait for it to start listening
beforeAll(async function(done) {
  try {
    // Don't time out if this takes a while
    let orig = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = Infinity;

    // Build the image
    await composeBuild();

    // Start the server
    let {stdout, stderr} = await startServer();

    // save these for later
    this.__stdout__ = stdout;
    this.__stderr__ = stderr;

    jasmine.DEFAULT_TIMEOUT_INTERVAL = orig;

    done();
  } catch(err) {
    done(err);
  }
});

// Stop the server after all tests have been run
afterAll(function(done) {
  dockerDown().then(done);
});