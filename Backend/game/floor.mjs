/** @module backend/game/Floor */
import FloorCommon from "../../Frontend/game/common/floor.mjs";
import GameMap from "./game-map";
import Monster from "./monster.mjs";

const MONSTER_MOVES_PER_MS = 10;

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

  /** katie
   * Puts a monster in half of all "rooms".
   * @param {Floor} floor The floor to add monsters to
   */
  generateMonsters() {
    this.monsters = [];
    for(let i = 0; i < this.map.rooms.length * this.monsterRatio; i++) { 
      this.monsters[i] = new Monster('sir spoopy', 100, 10, this, i, 1);
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
   */
  save() {
    return Promise.all([
      this.map.save(this.id),
      this.monsters[0].save() // NOTE: saves all monsters
    ]);
  }

  /**
   * Moves all monsters and checks for collisions (also anything else that happens every turn)
   * @param {number} deltaTime The time that has ellasped since the last tick
   */
  tick(deltaTime) {
    let moves = Math.floor(deltaTime / MONSTER_MOVES_PER_MS);

    for(let monster of this.monsters) {
      monster.figureOutWhereToGo();

      // HACK: Monsters should move based on deltaTime
      for(let i = 0; i < moves; ++i) {
        monster.move();
      }
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