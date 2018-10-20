import GameMapCommon from "../common/game-map.mjs";

export default class GameMap extends GameMapCommon {
  /**
   * Geneate a game map
   * @returns {GameMap}
   */
  static generate(params) {
    return GameMapCommon.generate(new GameMap(), params);
  }
  
  /**
   * Load the game map in the browser
   * @param {Floor} floor The floor to load the map for
   */
  static async load(floor) {
    // for backwards compatability the map for floorIdx == 0 is just the gameId
    let mapId = floor.id.replace("-0", "");

    let res = await fetch(`/public/maps/${mapId}.json`);
    let json = await res.json();
      
    floor.map = GameMap.parse(json);
  }
}