/** @module PlayerCommon */
/**
 * The player class.
 */
export default class PlayerCommon {

  /**
   * @param {string} name - The name of the player. Should be the same as user.username
   * @param {int} hp - The player's hitpoints
   * @param {string} sprite - The name of the sprite for this player.
   * @param {floor} floor - The floor this player is on.
   */
  constructor(name, hp, spriteName, floor) {
    this.name = name;
    this.hp = hp;
    this.alive = true;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.spriteName = spriteName;
    this.floor = floor;
  }

  /**
   * Get the position of the player.
   * @return {object}
   */
  getPosition() {
    return { x: this.x, y: this.y };
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
  // eslint-disable-next-line complexity
  keyPress(input, speed) {
    let keys = {
      upArrow: 38,
      w: 87,
      rightArrow: 39,
      d: 68,
      downArrow: 40,
      s: 83,
      leftArrow: 37,
      a: 65
    };
    switch(input) {
    case keys.upArrow:
    case keys.w:
      this.y -= speed;
      break;
    case keys.downArrow:
    case keys.s:
      this.y += speed;
      break;
    case keys.leftArrow:
    case keys.a:
      this.x -= speed;
      break;
    case keys.rightArrow:
    case keys.d:
      this.x += speed;
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

  /**
   * Checks to see if whole sprite is on the map. (Same as monster class)
   * @returns {boolean}
   */
  spriteIsOnMap() {
    return this.floor.map.isOnMap(this.x, this.y) &&
      this.floor.map.isOnMap(this.x + PlayerCommon.SPRITE_SIZE, this.y) &&
      this.floor.map.isOnMap(this.x, this.y + PlayerCommon.SPRITE_SIZE) &&
      this.floor.map.isOnMap(this.x + PlayerCommon.SPRITE_SIZE, this.y + PlayerCommon.SPRITE_SIZE);
  }

  /**
   * Set coordinates for this player
   * @param {int} x - new x-coordinate,
   * @param {int} y - new y-coordinate
   */
  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

}
PlayerCommon.SPRITE_SIZE = 48;
