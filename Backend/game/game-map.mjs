import GameMapCommon from "../../Frontend/game/common/game-map/game-map.mjs";
import fs from "fs";
import util from "util";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export default class GameMap extends GameMapCommon {
  /**
   * Geneate a game map
   * @returns {GameMap}
   */
  static generate(params) {
    return GameMapCommon.generate(new GameMap(), params);
  }

  /**
   * Load the game map in nodejs
   * @param {Floor} floor The floor to load the map for
   */
  async load(floor) {
    // for backwards compatability the map for floorIdx == 0 is just the gameId
    let mapId = floor.id.replace("-0", "");

    floor.map = GameMap.parse(await readFile(`Frontend/public/maps/${mapId}.json`, "utf8"), new GameMap());
  }

  /**
   * Save the game map in nodejs
   * @param {string} id The floor id to save the map for
   */
  save(floorId) {
    // for backwards compatability the map for floorIdx == 0 is just the gameId
    let mapId = floorId.replace("-0", "");

    return writeFile(`Frontend/public/maps/${mapId}.json`, this.serialize());
  }
}