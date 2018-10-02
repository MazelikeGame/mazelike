/* global it */
const request = require("request");

global.itAsync = (msg, fn) => {
  it(msg, (done) => {
    Promise.resolve(fn())
      .then(() => {
        done();
      }, done);
  });
};

global.requestAsync = (...opts) => {
  return new Promise((resolve, reject) => {
    request(...opts, (err, res, body) => {
      if(err) {
        reject(err);
      } else {
        resolve({res, body});
      }
    });
  });
};