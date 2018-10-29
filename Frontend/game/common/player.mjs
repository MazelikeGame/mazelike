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
  constructor(name, hp, spawn, sprite) {
    this.name = name;
    this.hp = hp;
    this.xPos = spawn.x;
    this.yPos = spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.sprite = sprite;
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
   * Get the hp of this player
   * @return {int} This player's hp.
   */
  getHp() {
    return this.hp;
  }

  /**
   * Get the velocity of the player
   * @return {object} { vx: int, vy: int }
   */
  getVelocity() {
    return { vx: this.vx, vy: this.vy };
  }

  /**
   * Update the player's velocity from key input.
   * @param {int(s)} User's keyboard input
   */
  keyPress(input) {
    let keyCodes = {
      up: ['38', '87'], // up and 'w'
      right: ['39', '68'], // right and 'd'
      down: ['40', '83'], // down and 's'
      left: ['37', '65'] // left and 'a'
    };
    switch(input) {
    case keyCodes.up:
      this.vx = 0;
      this.vy = -5;
      break;
    case keyCodes.right:
      this.vx = 5;
      this.vy = 0;
      break;
    case keyCodes.down:
      this.vx = 0;
      this.vy = 5;
      break;
    case keyCodes.left:
      this.vx = -5;
      this.vy = 0;
      break;
    default:
      break;
    }
  }

  /**
   * Modify player's velocity on key release
   * @param {String} The name of the key released
   */
  keyRelease() {
    this.vx = 0;
    this.vy = 0;
  }
}
