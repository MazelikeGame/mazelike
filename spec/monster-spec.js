const chai = require("chai");

import Monster from "../Frontend/game/Monster.js";

describe('Monster Tests', () => {
  it('Monsters can be created', (done) => {

    //Requires PIXI, but we can't use it to run the tests on the server.
    //Can only test functions without PIXI calls.
    //Discuss how to get around this.
    let testMonster = new Monster("Testing", 100, 100);

    chai.assert.equal(testMonster.name, "Testing");
    done();
  });
});
