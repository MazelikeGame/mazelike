/*global PIXI*/

/**
 * The ladder
 */
export default class Ladder {
  
  constructor() {
    this.x = 0;
    this.y = 0;
    this.sprite = new PIXI.Sprite.fromImage('DawnLike/Objects/ladder.png');
    this.sprite.position.set(this.x, this.y);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.position.set(this.x, this.y);
  }

  update(viewX, viewY) {
    this.sprite.position.set(this.x - viewX, this.y - viewY);
  }
}