const Player = require('../player.js');


describe("Player Suite", function() {
  var Bob = new Player("Bob", 0, 0);

  it("1.0 Player's name should be defined", function() {
    expect(Bob.Name).toBeDefined();
  });

  it("1.1 Player's name should be Bob", function() {
    expect(Bob.Name).toBe("Bob");
  });

  it("1.1 Player's name should be not be bob", function() {
    expect(Bob.Name).not.toBe("bob");
  });
});

describe("Move Test", function() {
  var Bob = new Player("Bob", 0, 0);

  it("2.0 Player's x value should be equal to 0.", function() {
    expect(Bob.x).toEqual(0)
  });

  it("2.0 Player's x value should be equal to 0.", function() {
    expect(Bob.x).not.toEqual(0)
  });
});
