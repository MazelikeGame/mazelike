/* global describe it SERVER_URL requestAsync */
var request = require('request');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var login_url = `${SERVER_URL}/account/login`;
var create_url = `${SERVER_URL}/account/create`;
var edit_url = `${SERVER_URL}/account/edit`;

var view_url = `${SERVER_URL}/account/view`;
var dashboard_url = `${SERVER_URL}/account/dashboard`;

const random = Math.floor(Math.random() * 10000000);

describe('Create route tests', () => {
  it('Can visit /create', (done) => {
    request.get(create_url, function(err, response, body) {
      try {
        assert.equal(response.statusCode, 200);
      } catch(e) {
        done(e);
      }
      done();
    });
  });

  it('Can create an account', (done) => {
    request.post({
      url: create_url,
      form: { username: `test-account-${random}`, password: `test-account-${random}`, email: `test-account-${random}@test.com` }
    }, function(err, response, body) {
      try {
        assert.equal(response.statusCode, 302);
      } catch(e) {
        done(e);
      }
      done();
    });
  });
});


describe('Login route tests', () => {
  it('Can visit login', (done) => {
    request.get(login_url, function(err, response, body) {
      try {
        assert.equal(response.statusCode, 200);
      } catch(e) {
        done(e);
      }
      done();
    });
  });

  it('Can login ', (done) => {
    request.post({
      url: create_url,
      form: { username: `test-account-${random}`, password: `test-account-${random}`, email: `test-account-${random}@test.com` }
    }, function(err, response, body) {
      try {
        assert.equal(response.statusCode, 200);
      } catch(e) {
        done(e);
      }
    });
    request.post({
      url: login_url,
      form: { username: `test-account-${random}`, password: 'password' }
    }, function(err, response, body) {
      try {
        assert.equal(response.statusCode, 200);
      } catch(e) {
        done(e);
      }
      done();
    });
  });

  itAsync("can redirect users to their original url", async() => {
    await requestAsync({
      method: "get",
      url: `${SERVER_URL}/account/logout`,
      followRedirect: false,
      jar: true
    });

    await requestAsync({
      method: "get",
      url: `${SERVER_URL}/account/logout`,
      followRedirect: false,
      jar: true
    });

    let {res} = await requestAsync({
      method: "post",
      url: `${SERVER_URL}/account/create?returnUrl=%2Fgame%2Fnew`,
      followRedirect: false,
      jar: true,
      form: {
        username: "bazinga",
        email: "bazzinga@bazzinga.com",
        password: "bazzinga"
      }
    });

    chai.should().equal(res.statusCode, 302);
    chai.should().equal(res.headers.location, "/account/login?returnUrl=%2Fgame%2Fnew");

    let {res: res2} = await requestAsync({
      method: "post",
      url: `${SERVER_URL}${res.headers.location}`,
      followRedirect: false,
      jar: true,
      form: {
        username: "bazzinga",
        password: "bazzinga"
      }
    });

    chai.should().equal(res2.statusCode, 302);
    chai.should().equal(res2.headers.location, "/game/new");
  });
});

describe('Edit route tests', () => {
  it('Can visit edit route', (done) => {
    request.get(edit_url, function(err, response, body) {
      try {
        assert.equal(response.statusCode, 200);
      } catch (e) {
        done(e);
      }
      done();
    });
  });
});

describe('Visit route test', () => {
  it('Can visit the view route', (done) => {
    request.get(view_url, function(err, response, body) {
      try {
        assert.equal(response.statusCode, 200);
        done();
      } catch(e) {
        done(e);
      }
    });
  });
});

describe('Dashboard route test', () => {
  it('Can visit the dashboard route', (done) => {
    request.get(dashboard_url, function(err, response, body) {
      try {
        assert.equal(response.statusCode, 200);
        done();
      } catch(e) {
        done(e);
      }
    });
  });
});