import {MIN_SIZE} from "./game-map-const.mjs";

/**
 * A corridor in the maze
 * @prop {number} x The x coordinate for the corridor to start
 * @prop {number} y The y coordinate for the corridor to start
 * @prop {number} width The width of the corridor
 * @prop {number} height The height of the corridor
 * @prop {number} weight The weight to use for graph algorithms
 * @prop {string} type Always corridor
 */
export default class Corridor {
  /**
   * <span style="color: red;">Constructor is private.</span>
   * See Room or GameMap.getRect for instances of Corridor.
   * @private
   * @param x 
   * @param y 
   * @param width 
   * @param height 
   * @param mapParams 
   */
  constructor(x, y, width, height, mapParams) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this._params = mapParams;
    this.weight = this.width === this._params.corridorSize ? this.height : this.width;
    this.type = "corridor";
  }

  /**
   * Clone this edge with the room as room
   * @private
   */
  _to(room) {
    let clone = Object.create(Corridor.prototype);
    clone.room = room;
    return Object.assign(clone, this);
  }

  /**
   * Convert the corridor to json
   * @private
   */
  toJSON() {
    return {
      x: this.x / MIN_SIZE,
      y: this.y / MIN_SIZE,
      w: this.width / MIN_SIZE,
      h: this.height / MIN_SIZE,
      r: this._rendererName
    };
  }

  /**
   * Convert json into a Corridor
   * @private
   */
  static _parse(json, mapParams) {
    let corridor = new Corridor(
      json.x * MIN_SIZE,
      json.y * MIN_SIZE,
      json.w * MIN_SIZE,
      json.h * MIN_SIZE,
      mapParams
    );

    corridor._rendererName = json.r;
    return corridor;
  }
}