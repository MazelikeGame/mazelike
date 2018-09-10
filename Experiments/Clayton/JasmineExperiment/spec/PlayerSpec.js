const Player = require('../player.js');

var test = new Player("Hello", 0, 0);
test.Move();
console.log(test.x);
describe("A suite", function() {
    it("contains spec with an expectation", function() {
      expect(test.Name).toBe("Helflo");
    });
  });
