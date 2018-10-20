import FloorCommon from "../common/floor.mjs";
import GameMap from "./game-map.mjs";

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
   * Load everything in the browser
   * @param gameId The game id for the game we want to load
   * @param floorIdx The index of floor we want to load
   */
  static async load(gameId, floorIdx) {
    let floor = new Floor(gameId, floorIdx);

    await Promise.all([
      // NOTE: You should define your functions here and they should
      // return a promise for when they complete.  All modifications to
      // floor should be done to the floor variable you pass in like so.
      GameMap.load(floor)
    ]);

    return floor;
  }

  save() {
    // stub
  }
}