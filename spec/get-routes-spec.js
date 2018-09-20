/* global describe it */
const http = require("http");

describe("Basic GET testing", () => {
  checkRoute("/");
});

// Define a basic GET test
function checkRoute(url) {
  it(`Get ${url} responds ok`, (done) => {
    let req = http.get("http://localhost:3000/", (res) => {
      if(res.statusCode !== 200 && res.statusCode !== 304) {
        done(new Error(`Bad status code ${res.statusCode}`));
      } else {
        done();
      }
    });
    
    req.on("error", done);
  });
}