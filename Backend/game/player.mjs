/* jshint node: true */
import PlayerCommon from '../../Frontend/game/common/player.mjs';

/** @module backend/game/player */
/**
 * TODO: Have Player inherit from class Character. Same goes for Monster class.
 */

/**
 * The player class.
 */
export default class Player extends PlayerCommon {

  constructor(name, hp, spawn) {
    super(name, hp, spawn);
    this.load = this.load.bind(this);
  }
  /**
   * Load a Player
   * @param {Floor} floor - The floor to load the player for
   */
  static async load(floor) {
    if(!floor.players) {
      floor.players = [];
    }
    // TODO: Get the username of the users. Query some table for games
    floor.players.push(new Player('billy', 100, {x: 0, y: 0}));
  }
}
