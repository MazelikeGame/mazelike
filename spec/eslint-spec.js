/* global describe it */
const child_process = require("child_process");

describe("Eslint", () => {
  it("run", () => {
    child_process.execSync("npm run eslint");
  });
});