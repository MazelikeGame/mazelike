/* global beforeAll jasmine */
const http = require("http");

// Try to connect to the server
function pingServer() {
  return new Promise((resolve) => {
    http.get("http://backend:3000/", resolve.bind(undefined, true))
      .on("error", resolve.bind(undefined, false));
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
  while(!await pingServer()) {
    await sleep(3000);
  }

  done();
});
