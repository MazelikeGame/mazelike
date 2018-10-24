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
    // below: ratio of Monsters to Rooms. ex: 0.3333 puts monsters in a third of the rooms.
    this.monsterRatio = 0.3333;
    // Initialize players, monsters and the game map in loadBrowser, loadNode,  and generate methods
  }

}

export default Floor;