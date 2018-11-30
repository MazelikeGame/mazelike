/** @module Item **/

export default class Item {
  /**
   * @param {string} spriteName - Required. Name of the sprite.
   * @param {int} spriteSize - Required. Size of the sprite.
   * @param {int} movementSpeed - Bonus to movementSpeed applied to player.
   * @param {int} attackSpeed - Bonus to attackSpeed applied to player.
   * @param {int} attack - Bonus to attack applied to player.
   * @param {int} defence - Bonus to defence applied to player.
   * @param {int} range - Bonus to range applied to player.
   */
  constructor(
    floor,
    spriteName,
    spriteSize,
    movementSpeed,
    attackSpeed,
    attack,
    defence,
    range,
    id,
    category,
    accuracy,
    attackStyle
  ) {
    this.floor = floor;
    this.spriteName = spriteName;
    this.spriteSize = spriteSize;
    this.movementSpeed = movementSpeed || 0;
    this.attackSpeed = attackSpeed;
    this.attack = attack;
    this.defence = defence;
    this.range = range;
    this.id = id;
    this.category = category;
    this.accruacy = accuracy;
    this.attackStyle = attackStyle;
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
