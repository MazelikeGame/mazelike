/* global describe itAsync */
const request = require("request");
const chai = require("chai");

const requestAsync = (...opts) => {
  return new Promise((resolve, reject) => {
    request(...opts)
      .on("response", resolve)
      .on("error", reject);
  });
};

// let lobbyId;

describe("Lobby", function() {
  itAsync("redirects non-users to login", async() => {
    let res = await requestAsync({
      url: "http://localhost:3001/game/new",
      followRedirect: false
    });

    chai.should().equal(res.statusCode, 302);
    chai.should().equal(res.headers.location, "/account/login");
  });
});