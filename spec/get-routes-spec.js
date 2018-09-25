/* global describe it */
const http = require("http");
// const querystring = require("querystring");

describe("Basic route testing", () => {
  checkRouteGet("/");

  /* Form example
  checkRoutePost("/account/create", {
    email: "foo@bar.com",
    username: "foo",
    password: "bar"
  });
  */
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
    let req = http.get(`http://localhost:3001${url}`, 
      makeResponseChecker(expectedStatus, done));
    
    req.on("error", done);
  });
}

/*
// Define a basic POST test
function checkRoutePost(url, body, expectedStatus) {
  it(`Post ${url} responds ok`, (done) => {
    let req = http.request({
      method: "post",
      hostname: "localhost",
      port: 3000,
      path: url,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }, makeResponseChecker(expectedStatus, done));
    
    req.on("error", done);
    req.end(querystring.stringify(body));
  });
}
*/