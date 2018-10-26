/** @module common/game-map/Room */
import {MIN_SIZE} from "./game-map-const.mjs";
import Corridor from "./corridor.mjs";

/**
 * A room in the maze
 * @prop {number} x X coordinate of the room
 * @prop {number} y Y coordinate of the room
 * @prop {number} width Width coordinate of the room
 * @prop {number} height Height coordinate of the room
 * @prop {string} type Always room
 */
export default class Room {
  /**
   * <span style="color: red;">Constructor is private.</span>
   * See GameMap.rooms or GameMap.getRect for instances of Room.
   * @private
   * @param i The index of the room
   * @param x 
   * @param y 
   * @param width 
   * @param height 
   * @param mapParams 
   */
  constructor(i, x, y, width, height, mapParams) {
    this._i = i;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this._params = mapParams;
    this.type = "room";
  
    this._corridors = new Map();
  }

  /**
   * Create a corridor between 2 rooms
   * @private
   */
  _connect(room, corridor) {
    this._corridors.set(room._i, corridor._to(room));
    room._corridors.set(this._i, corridor._to(this));
  }

  /**
   * All corridors connected to this room
   * @return {Corridor[]}
   */
  get corridors() {
    return Array.from(this._corridors.values());
  }

  /**
   * Get the room to the left of this one (if one exists)
   * @return {Room}
   */
  get left() {
    return this._corridors.get(this._i - 1);
  }

  /**
   * Get the room to the right of this one (if one exists)
   * @return {Room}
   */
  get right() {
    return this._corridors.get(this._i + 1);
  }

  /**
   * Get the room above this one (if one exists)
   * @return {Room}
   */
  get above() {
    return this._corridors.get(this._i - this._params.size);
  }

  /**
   * Get the room below this one (if one exists)
   * @return {Room}
   */
  get below() {
    return this._corridors.get(this._i + this._params.size);
  }

  /**
   * Convert the room to json
   * @private
   */
  toJSON() {
    let raw = {
      x: this.x / MIN_SIZE,
      y: this.y / MIN_SIZE,
      w: this.width / MIN_SIZE,
      h: this.height / MIN_SIZE,
      r: this._rendererName
    };

    if(this.left) {
      raw.l = this.left.toJSON();
    }

    if(this.above) {
      raw.a = this.above.toJSON();
    }

    return raw;
  }

  /**
   * Convert json into a Room
   * @private
   */
  static _parse(i, rooms, json, mapParams) {
    let room = new Room(
      i,
      json.x * MIN_SIZE,
      json.y * MIN_SIZE,
      json.w * MIN_SIZE,
      json.h * MIN_SIZE,
      mapParams
    );

    if(json.l) {
      room._connect(rooms[i - 1], Corridor._parse(json.l, mapParams));
    }

    if(json.a) {
      room._connect(rooms[i - room._params.size], Corridor._parse(json.a, mapParams));
    }

    room._rendererName = json.r;

    return room;
  }
}