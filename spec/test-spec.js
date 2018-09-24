/* global describe it */
var request = require('request');
var base_url = 'http://localhost:3000/';
var login_url = 'http://localhost:3000/account/login';
var create_url = 'http://localhost:3000/account/create';


describe("An example test", () => {
  it("Passes", () => {
    // throw new Error("Fail");
  });
});

describe('Create route tests', () => {
  it('Can visit /create', () => {
    request.get(create_url, function(err, response, body) {
      expect(response.statusCode.toBe(200));
      expect(response.url.toBe(create_url));
    });
  });

  it('Can create an account', () => {
    request.post({
      url: create_url,
      form: { username: 'test', password: 'test', email: 'test@test.com' }
    }, function(err, response, body) {
      expect(response.url).toBe(login_url);
    });
  });
});

describe('Login route tests', () => {
  it('Can visit login', () => {
    request.get(login_url, function(err, response, body) {
      expect(response.statusCode).toBe(200);
      expect(response.url.toBe(login_url));
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
