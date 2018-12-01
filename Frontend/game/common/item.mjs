/** @module Item **/

export default class Item {
  /**
   * @param {floor} floor - Floor that this item exists on
   * @param {string} spriteName - Name of the sprite.
   * @param {int} spriteSize - Size of the sprite.
   * @param {int} movementSpeed - Bonus to movementSpeed applied to player.
   * @param {int} attackSpeed - Bonus to attackSpeed applied to player.
   * @param {int} attack - Bonus to attack applied to player.
   * @param {int} defence - Bonus to defence applied to player.
   * @param {int} range - Bonus to range applied to player.
   * @param {int} id
   * @param {string} category - The resource category for the sprite
   * @param {int} accuracy - Angle or width of the semi-circle or rectangle for attacking
   * @param {string} attackStyle - Could be ranged or melee, or null if not a weapon
   */
  /* eslint-disable-next-line complexity */
  constructor(
    floor,
    spriteName,
    spriteSize,
    movementSpeed,
    damage,
    attackSpeed,
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
    this.attackSpeed = attackSpeed || 0;
    this.damage = damage || 0;
    this.defence = defence || 0;
    this.range = range || 0;
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
   * Puts item in a state that signifies that it has been
   * placed in an inventory
   */
  pickup() {
    this.setCoordinates(null, null);
    this.isOnFloor = false;
  }

  /**
   * Get the size of the sprite for this item.
   */
  getSpriteSize() {
    return this.spriteSize;
  }
}
