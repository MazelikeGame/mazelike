/* global beforeAll jasmine SERVER_URL */
const http = require("http");

global.SERVER_URL = process.env.IS_RUNNING_IN_DOCKER ?
  "http://backend:3000" : "http://localhost:3000";

let i = 0;

// Try to connect to the server
function pingServer() {
  return new Promise((resolve) => {
    http.get(SERVER_URL, resolve.bind(undefined, true))
      .on("error", function(err) {
        process.stderr.write(`[${i+1}/30] Could not GET ${SERVER_URL}/: ${err.message}\n`);
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
  while(!await pingServer() && i < 30) {
    await sleep(3000);
    ++i;
  }

  done();
});