import LadderCommon from "../common/ladder.mjs";

/*global PIXI*/
export default class Ladder extends LadderCommon {
  constructor() {
    super();
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