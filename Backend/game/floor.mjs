/** @module backend/game/Floor */
import FloorCommon from "../../Frontend/game/common/floor.mjs";
import GameMap from "./game-map";
import Player from "./player.mjs";

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

    return floor;
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
      Player.load(floor)
    ]);

    return floor;
  }

  /**
   * Save the floor (server side)
   */
  save() {
    return Promise.all([
      this.map.save(this.id)
    ]);
  }
}
