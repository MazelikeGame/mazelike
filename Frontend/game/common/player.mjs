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
    this.damage = 10;
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
   */
  handleKeyPress(e) { // eslint-disable-line complexity
    this.input[e.keyCode] = e.type === 'keydown';
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
  }

  /**
   * Update the player's position based off the player's velocity
   */
  move() {
    let oldPosition = this.getPosition();
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

  /** 
   * Monster attacks player
   * @param {*} hp health points that the player's health decrements by
   */
  beAttacked(hp) {
    this.hp -= hp;
    if(this.hp <= 0) {
      this.die();
    }
  }

  /** 
   * Player attacks monster
   * @param {*} monsterID id for player that monster is attacking
   */
  attack(monsterID) {
    this.floor.monsters[monsterID].beAttacked(this.damage);
  }
}
PlayerCommon.SPRITE_SIZE = 48;
