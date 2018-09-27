/* global it */

global.itAsync = (msg, fn) => {
  it(msg, (done) => {
    Promise.resolve(fn())
      .then(() => {
        done();
      }, done);
  });
};