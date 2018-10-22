import PlayerCommon from "../../Frontend/game/common/player.mjs";

/** @module Player */

/**
 * TODO: Have Player inherit from class Character. Same goes for Monster class.
 */

/**
 * The player class.
 */
export default class Player extends PlayerCommon {

  /**
   * @param {string} name - The name of the player. Should be the same as user.username
   * @param {int} hp - The player's hitpoints
   * @param {object} spawn - Contains the spawn coordinates { x: int, y: int }.
   */
  constructor(name, hp, spawn) {
    super(name, hp, spawn);
  }

  /**
   * Load a Player
   */
  async load() {

  }
}
