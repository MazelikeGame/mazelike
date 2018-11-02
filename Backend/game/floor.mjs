/** @module backend/game/Floor */
import FloorCommon from "../../Frontend/game/common/floor.mjs";
import GameMap from "./game-map";
import Monster from "./monster.mjs";

export default class Floor extends FloorCommon {
  /**
   * Generate a new floor (runs on the server and the browser)
   * @param gameId The game id for the game we want to generate
   * @param floorIdx The index of floor we want to generate
   * @param {object} opts The options of the specific generators
   */
  static generate({gameId, floorIdx, map}) {
    let floor = new Floor(gameId, floorIdx);

    floor.map = GameMap.generate(map);

    floor.generateMonsters();

    return floor;
  }

  /**
   * Puts a monster in half of all "rooms".
   * @param {Floor} floor The floor to add monsters to
   */
  generateMonsters() {
    this.monsters = [];
    let random = 0;
    for(let i = 0; i < this.map.rooms.length * this.monsterRatio; i++) {
      random = Math.floor(Math.random() * 100);
      if(random < 15) { // 15% chance for blue demon
        this.monsters[i] = new Monster('blue demon', 150, 10, this, i, 'blue');
      } else if(random < 50) { // 35% chance for red demon, where 15+35 = 50
        this.monsters[i] = new Monster('red demon', 100, 5, this, i, 'red');
      } else if(random < 100) { // 50% chance for green demon, where 15+35+50 = 100
        this.monsters[i] = new Monster('green demon', 50, 5, this, i, 'green');
      }
    }
  }

  /**
   * Load everything on the server
   * @param gameId The game id for the game we want to load
   * @param floorIdx The index of floor we want to load
   */
  static async load(gameId, floorIdx) {
    let floor = new Floor(gameId, floorIdx);

    await Promise.all([
      GameMap.load(floor),
      Monster.load(floor)
    ]);

    return floor;
  }

  /**
   * Save the floor (server side)
   * @param {boolean} create Create new rows (first save only)
   */
  save(create) {
    return Promise.all([
      this.map.save(this.id),
      Monster.saveAll(this, create)
    ]);
  }

  /**
   * Moves all monsters and checks for collisions (also anything else that happens every turn)
   * @param {number} deltaTime The time that has ellasped since the last tick
   */
  tick(deltaTime) {
    for(let monster of this.monsters) {
      let moves = Math.floor(deltaTime / monster.speed);

      // HACK: Monsters should move based on deltaTime
      for(let i = 0; i < moves; ++i) {
        monster.move(); // monster-monster collision check happens here
      }

      monster.figureOutWhereToGo();
    }
  }

  /**
   * Send the current state of the floor to the client
   * @param {} io The socket io instance (not a sock)
   */
  sendState(io) {
    io.emit("state", {
      monsters: this.monsters
    });
  }
}
