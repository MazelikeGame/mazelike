import LadderCommon from "../common/ladder.mjs";

/*global PIXI*/
/** @module Item */
export default class Ladder extends LadderCommon {
  constructor() {
    super();
    this.sprite = new PIXI.Sprite.fromImage('DawnLike/Objects/ladder.png');
    this.sprite.position.set(this.x, this.y);
  }

  /**
   * Sets the ladder's x and y values.
   * @param x the x value we want to set x
   * @param y the y value we want to set y
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.position.set(this.x, this.y);
  }

  /**
   * Updates the sprite position
   * @param viewX the view x
   * @param viewY the view y
   */
  update(viewX, viewY) {
    this.sprite.position.set(this.x - viewX, this.y - viewY);
  }
}