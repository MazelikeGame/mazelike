/* global describe it */
const http = require("http");

describe("An example test", () => {
  it("Passes", (done) => {
    http.get("http://localhost:3000/", done).on("error", done);
  });
});