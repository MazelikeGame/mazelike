/* global describe it */
var request = require('request');
var base_url = 'http://localhost:3000/';
var login_url = 'http://localhost:3000/account/login';


describe("An example test", () => {
  it("Passes", () => {
    // throw new Error("Fail");
  });
});

describe('Login route tests', () => {
  it('Can visit login', () => {
    request.get(login_url, function(err, response, body) {
      expect(response.statusCode).toBe(200);
    });
  });

  it('Can login with default credentials', () => {
    request.post({
      url: login_url,
      form: { username: 'test', password: 'password' }
    }, function(err, response, body) {
      expect(response.url).toBe(base_url);
    });
  });
});
