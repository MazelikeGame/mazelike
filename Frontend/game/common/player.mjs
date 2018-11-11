/** @module PlayerCommon */
/**
 * The player class.
 */
export default class PlayerCommon {

  /**
   * @param {string} name - The name of the player. Should be the same as user.username
   * @param {int} hp - The player's hitpoints
   * @param {string} spriteName - The name of the sprite for this player.
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
    this.speed = 15;
    this.input = [];
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
   * @param {event} e - User's keyboard input,
   * @param {int} speed - Desired speed of the player(should switch to this.speed)
   */
  handleKeyPress(e) {
    this.input[e.keyCode] = e.type === 'keydown';
    this.move();
  }

  move() { // eslint-disable-line complexity
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
    if(this.input) {
      if(this.input[keys.leftArrow] || this.input[keys.a]) {
        this.vx = -this.speed;
      }
      if(this.input[keys.rightArrow] || this.input[keys.d]) {
        this.vx = this.speed;
      }
      if(this.input[keys.upArrow] || this.input[keys.w]) {
        this.vy = -this.speed;
      }
      if(this.input[keys.downArrow] || this.input[keys.s]) {
        this.vy = this.speed;
      }
    }
    let oldPosition = {
      x: this.x,
      y: this.y
    };
    this.x += this.vx;
    this.y += this.vy;
    if(!this.spriteIsOnMap()) {
      this.setCoordinates(oldPosition.x, oldPosition.y);
    }
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
