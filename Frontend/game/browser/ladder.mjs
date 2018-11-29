import LadderCommon from "../common/ladder.mjs";

export default class Ladder extends LadderCommon {
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.position.set(this.x, this.y);
  }

  update(viewX, viewY) {
    this.sprite.position.set(this.x - viewX, this.y - viewY);
  }
}