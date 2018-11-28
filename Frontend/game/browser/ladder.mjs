/*global PIXI*/

/**
 * The ladder
 */
export default class Ladder {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.spriteName = "ladder";
    this.sprite = new PIXI.Sprite(PIXI.loader.resources.player.textures[this.spriteName]);
    this.sprite.position.set(this.x, this.y);
    this.sprite.width = 48;
    this.sprite.height = 48;
  }

  set x(x) {
    this.x = x;
    this.sprite.x = x;
  }

  set y(y) {
    this.y = y;
    this.sprite.y = y;
  }
}