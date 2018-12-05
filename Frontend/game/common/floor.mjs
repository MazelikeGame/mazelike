/** @module common/Floor */
import "./game-map/game-map-renderers.mjs";

/**
 * The game map, monsters, players and items for this floor
 */
class Floor {
  /**
   * @private
   * @param gameId The game id for the current game
   * @param floorIdx The index of this floor
   */
  constructor(gameId, floorIdx) {
    this.id = `${gameId}-${floorIdx}`;
    // below: ratio of Monsters to Rooms. ex: 0.4 puts monsters in a fourth of the rooms.
    this.monsterRatio = 1;
    // Initialize players, monsters and the game map in loadBrowser, loadNode,  and generate methods
  }
 
  /**
   * The interval at which we update the game state (if this is too short the server will break)
   */
  static get UPDATE_INTERVAL() {
    return 100;
  }
}

export default Floor;
