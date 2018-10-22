/* global PIXI */
/** @module Player */

/**
 * TODO: Have Player inherit from class Character. Same goes for Monster class.
 */

/**
 * The player class.
 */
export default class Player {

  /**
   * @param {string} name - The name of the player. Should be the same as user.username
   * @param {int} hp - The player's hitpoints
   * @param {object} spawn - Contains the spawn coordinates { x: int, y: int }.
   */
  constructor(name, hp, spawn) {
    this.name = name;
    this.hp = hp;
    this.xPos = spawn.x;
    this.yPos = spawn.y;
  }

  /**
   * Get the position of the player.
   * @return {object}
   */
  getPosition() {
    return { x: this.xPos, y: this.yPos };
  }

  /**
   * Get the name of the player
   * @return {String} Name of this player.
   */
  getName() {
    return this.name;
  }

  /**
   * Return the
   */
  getHp() {
    return this.hp;
  }
}
