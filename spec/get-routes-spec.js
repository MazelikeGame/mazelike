/* global describe it SERVER_URL */
const http = require("http");
// const querystring = require("querystring");

describe("Basic route testing", () => {
  checkRouteGet("/");
});

// create a function that checks a http response
const makeResponseChecker = (expectedStatus, done) => {
  return (res) => {
    let isOk = expectedStatus !== undefined ?
      res.statusCode === expectedStatus :
      200 <= res.statusCode && res.statusCode < 400;

    if(isOk) {
      done();
    } else {
      done(new Error(`Bad status code ${res.statusCode}`));
    }
  };
};

// Define a basic GET test
function checkRouteGet(url, expectedStatus) {
  it(`Get ${url} responds ok`, (done) => {
    let req = http.get(`http://localhost:3000${url}`, 
      makeResponseChecker(expectedStatus, done));
    
    req.on("error", done);
  });
}
