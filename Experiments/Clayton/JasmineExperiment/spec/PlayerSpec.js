const Player = require('../player.js');



describe("Player Suite", function() {
    var Bob = new Player("Bob", 0, 0);

    it("1.0 Player's name should be defined", function() {
      expect(Bob.Name).toBeDefined();
    });

    it("1.1 Player's name should be Bob", function() {
      expect(Bob.Name).toBe("Bob");
    });
  });
