import LadderCommon from "../../Frontend/game/common/ladder.mjs";

export default class Ladder extends LadderCommon {
  constructor(...args) {
    super(...args);
    this.placeInRandomRoom();
  }
}