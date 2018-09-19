/* global describe it */
var request = require('request');
var base_url = 'http://localhost:3000/';
var update_url = 'http://localhost:3000/account/update';
var create_url = 'http://localhost:3000/account/create';


describe("General site tests", () => {
  it("/ returns 200", () => {
    request.get(base_url, function(err, response, body) {
      expect(response.statusCode).toBe(200);
    });
  });
});

describe('Auth tests', () => {
  it('/create returns 200', () => {
    request.get(create_url, function(err, response, body) {
      expect(response.statusCode).toBe(200);
    });
  });

  it('/update returns 200', () => {
    request.get(update_url, function(err, response, body) {
      expect(response.statusCode).toBe(200);
    });
  });
});
