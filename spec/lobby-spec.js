/* global describe itAsync */
const request = require("request");
const chai = require("chai");

const requestAsync = (...opts) => {
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

let lobbyId, joinUrl;

describe("Lobby", function() {
  itAsync("redirects non-users to login", async() => {
    let {res} = await requestAsync({
      url: "http://backend:3000/game/new",
      followRedirect: false
    });

    chai.should().equal(res.statusCode, 302);
    chai.should().equal(res.headers.location, "/account/login");
  });

  itAsync("can create a new game", async() => {
    await requestAsync({
      method: "post",
      url: "http://backend:3000/account/create",
      followRedirect: false,
      form: {
        username: "foo",
        email: "foo@test.com",
        password: "foo"
      }
    });

    await requestAsync({
      method: "post",
      url: "http://backend:3000/account/login",
      followRedirect: false,
      jar: true,
      form: {
        username: "foo",
        password: "foo"
      }
    });

    let {res} = await requestAsync({
      url: "http://backend:3000/game/new",
      followRedirect: false,
      jar: true
    });

    chai.should().equal(res.statusCode, 302);
    let match = res.headers.location.match(/^\/game\/lobby\/(.+)$/);
    chai.assert(match, `Got ${res.headers.location}`);

    lobbyId = match[1];
  });

  itAsync("can view a lobby", async() => {
    let {res} = await requestAsync({
      url: `http://backend:3000/game/lobby/${lobbyId}`,
      followRedirect: false
    });

    chai.should().equal(res.statusCode, 200);
  });

  itAsync("can view a lobby as user", async() => {
    let {res, body} = await requestAsync({
      url: `http://backend:3000/game/lobby/${lobbyId}`,
      followRedirect: false,
      jar: true
    });

    chai.should().equal(res.statusCode, 200);
    joinUrl = body.match(/http:\/\/backend:3000\/j\/([A-Za-z0-9]+)/);
    chai.assert(joinUrl, "Join url not found");
  });

  itAsync("can join a lobby", async() => {
    await requestAsync({
      method: "post",
      url: "http://backend:3000/account/create",
      followRedirect: false,
      form: {
        username: "bar",
        email: "bar@test.com",
        password: "bar"
      }
    });

    await requestAsync({
      method: "post",
      url: "http://backend:3000/account/login",
      followRedirect: false,
      jar: true,
      form: {
        username: "bar",
        password: "bar"
      }
    });

    if(!joinUrl) {
      throw new Error("can view a lobby needs to pass the join code");
    }

    let {res} = await requestAsync({
      url: joinUrl[0],
      followRedirect: false,
      jar: true
    });

    chai.should().equal(res.statusCode, 302);
    chai.should().equal(res.headers.location, `/game/lobby/${lobbyId}`);

    let {res: res2, body} = await requestAsync({
      url: `http://backend:3000/game/lobby/${lobbyId}`,
      followRedirect: false,
      jar: true
    });

    chai.should().equal(res2.statusCode, 200);
    chai.assert(body.indexOf("bar") !== -1, "bar not found in lobby");
  });

  itAsync("can drop a player", async() => {
    await requestAsync({
      method: "post",
      url: "http://backend:3000/account/login",
      followRedirect: false,
      jar: true,
      form: {
        username: "foo",
        password: "foo"
      }
    });

    let {res} = await requestAsync({
      url: `http://backend:3000/game/lobby/${lobbyId}/drop/bar`,
      followRedirect: false,
      jar: true
    });

    chai.should().equal(res.statusCode, 200);
    
    let {res: res2, body} = await requestAsync({
      url: `http://backend:3000/game/lobby/${lobbyId}`,
      followRedirect: false,
      jar: true
    });

    chai.should().equal(res2.statusCode, 200);
    chai.assert(body.indexOf("bar") !== -1, "bar not found in lobby");
  });

  itAsync("can delete a lobby", async() => {
    await requestAsync({
      url: `http://backend:3000/game/lobby/${lobbyId}/delete`,
      followRedirect: false,
      jar: true
    });

    let {res} = await requestAsync({
      url: `http://backend:3000/game/lobby/${lobbyId}`,
      followRedirect: false,
      jar: true
    });

    chai.should().equal(res.statusCode, 404);    
  });
});