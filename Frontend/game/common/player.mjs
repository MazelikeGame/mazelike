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
   * Prototype move function
   */
  move(deltaTime) {
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

  /**
   * Places player in a random "room"
   */
  placeInRandomRoom() {
    let isOnMap = false;
    while(!isOnMap) {
      let numRooms = this.floor.map.rooms.length;
      let randomRoom = Math.floor(Math.random() * numRooms);
      let randomDiffX = Math.floor(Math.random() * this.floor.map.rooms[randomRoom].width);
      this.x = this.floor.map.rooms[randomRoom].x + randomDiffX;
      let randomDiffY = Math.floor(Math.random() * this.floor.map.rooms[randomRoom].height);
      this.y = this.floor.map.rooms[randomRoom].x + randomDiffY;
      isOnMap = this.spriteIsOnMap();
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
