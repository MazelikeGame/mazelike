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

// Define a basic GET test
function checkRouteGet(url) {
  it(`Get ${url} responds ok`, (done) => {
    let req = http.get(`http://localhost:3000${url}`, (res) => {
      if(res.statusCode !== 200 && res.statusCode !== 304) {
        done(new Error(`Bad status code ${res.statusCode}`));
      } else {
        done();
      }
    });
    
    req.on("error", done);
  });
}

/*
// Define a basic POST test
function checkRoutePost(url, body) {
  it(`Post ${url} responds ok`, (done) => {
    let req = http.request({
      method: "post",
      hostname: "localhost",
      port: 3000,
      path: url,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }, (res) => {
      if(res.statusCode !== 200 && res.statusCode !== 304) {
        done(new Error(`Bad status code ${res.statusCode}`));
      } else {
        done();
      }
    });
    
    req.on("error", done);
    req.end(querystring.stringify(body));
  });
}
*/