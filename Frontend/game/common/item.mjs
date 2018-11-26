/** @module Item **/

export default class Item {
  /**
   * @param {string} spriteName - Required. Name of the sprite.
   * @param {int} spriteSize - Required. Size of the sprite.
   * @param {int} movementSpeed - Default value is 0. Bonus to movementSpeed applied to player.
   * @param {int} attackSpeed - Default value is 0. Bonus to attackSpeed applied to player.
   * @param {int} attack - Default value is 0. Bonus to attack applied to player.
   * @param {int} defence - Default value is 0. Bonus to defence applied to player.
   * @param {int} range - Default value is 0. Bonus to range applied to player.
   */
  constructor(spriteName, spriteSize, movementSpeed = 0, attackSpeed = 0, attack = 0, defence = 0, range = 0) {
    this.spriteName = spriteName;
    this.spriteSize = spriteSize;
    this.movementSpeed = movementSpeed;
    this.attackSpeed = attackSpeed;
    this.attack = attack;
    this.defence = defence;
    this.range = range;
    this.x = null;
    this.y = null;
    this.isOnFloor = false;
  }

  /**
   * Get the position of the item. Returns null if not on the floor or in a player's inventory
   * @return {object}
   */
  getPosition() {
    if(!this.isOnFloor) {
      return null;
    }
    return { x: this.x, y: this.y };
  }

  /**
   * Set coordinates for this item
   * @param {int} x - new x-coordiante,
   * @param {int} y - new y-coordinate
   */
  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
    this.isOnFloor = true;
  }

  /**
   * Get the size of the sprite for this item.
   */
  getSpriteSize() {
    return this.spriteSize;
  }
}
