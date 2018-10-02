/* global beforeAll jasmine SERVER_URL */
const http = require("http");

global.SERVER_URL = process.env.IS_RUNNING_IN_DOCKER ?
  "http://backend:3000" : "http://localhost:3000";

let retries = 0;
const MAX_RETRIES = 50;

// Try to connect to the server
function pingServer() {
  return new Promise((resolve) => {
    http.get(SERVER_URL, resolve.bind(undefined, true))
      .on("error", function(err) {
        process.stderr.write(`[${retries + 1}/${MAX_RETRIES}] Could not GET ${SERVER_URL}/: ${err.message}\n`);
        resolve(false);
      });
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Don't time out if this takes a while
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Start the server and wait for it to start listening
beforeAll(async function(done) {
  while(!await pingServer() && retries < MAX_RETRIES) {
    await sleep(5000);
    ++retries;
  }

  done();
});
