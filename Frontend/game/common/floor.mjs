/** @module common/Floor */
import "./game-map/game-map-renderers.mjs";
import Monster from "./monster.mjs";

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
    this.monsters = [];
    this.id = `${gameId}-${floorIdx}`;
    // Initialize players, monsters and the game map in loadBrowser, loadNode,  and generate methods
  }

  /** todo does this belong here?
   * Puts a monster in half of all "rooms".
   * @param {Floor} floor The floor to add monsters to
   */
  generateMonsters() {
    for(let i = 0; i < this.map.rooms.length / 2; i++) { 
      this.monsters[i] = new Monster('sir spoopy', 100, 10, this, i, 1);
    }
  }
}

export default Floor;