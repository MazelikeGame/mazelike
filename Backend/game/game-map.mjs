/** @module backend/game/GameMap */
import GameMapCommon from "../../Frontend/game/common/game-map/game-map.mjs";
import Maps from "../models/maps";

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
  static async load(floor) {
    let rawMap = await Maps.findOne({
      where: {
        floorId: floor.id
      }
    });

    floor.map = GameMap.parse(rawMap.map, new GameMap());
  }

  /**
   * Save the game map in nodejs
   * @param {string} id The floor id to save the map for
   */
  save(floorId, create) {
    if(create) {
      return Maps.create({
        floorId,
        map: this.serialize()
      });
    }
    
    return Maps.update({
      map: this.serialize()
    }, {
      where: {
        floorId
      }
    });
  }
}