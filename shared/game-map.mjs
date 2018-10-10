/* eslint-disable complexity,no-extra-parens,no-mixed-operators,consistent-return */
/** @module GameMap */

const BLOCK_SIZE = 48;
const BLOCK_TYPE = "0-1-box-big";
const SIZE = 10;
const NODES = SIZE ** 2;
const MIN_ROOM = 4;
const MAX_ROOM = 10;
const MAX_Y_DIST = 3;
const ROOM_CHANCE = 0.2;
const MAX_SCREEN_WIDTH = SIZE * (MAX_ROOM + MAX_Y_DIST);

/**
 * Map a 2d coordinate to a 1d coordinate
 * @private
 * @param {*} x 
 * @param {*} y 
 */
const d21 = (x, y, size = SIZE) => {
  return y * size + x;
};

/**
 * Map a 1d coordinate to a 2d coordinate
 * @private
 * @param {*} x 
 * @param {*} y 
 */
const d12 = (i, size = SIZE) => {
  return [i % size, Math.floor(i / size)];
};

/**
 * A room in the maze
 * @typedef {object} Room
 * @prop {number} x X coordinate of the room
 * @prop {number} y Y coordinate of the room
 * @prop {number} width Width coordinate of the room
 * @prop {number} height Height coordinate of the room
 * @prop {} _block Internal representation of the room using block based coordinates
 */
class Room {
  /**
   * @private
   * @param i The index of the room
   * @param x 
   * @param y 
   * @param width 
   * @param height 
   */
  constructor(i, x, y, width, height) {
    this._block = {x, y, width, height};

    this._i = i;
    this.x = x * BLOCK_SIZE;
    this.y = y * BLOCK_SIZE;
    this.width = width * BLOCK_SIZE;
    this.height = height * BLOCK_SIZE;
  
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

  get corridors() {
    return Array.from(this._corridors.values());
  }

  get left() {
    return this._corridors.get(this._i - 1);
  }

  get right() {
    return this._corridors.get(this._i + 1);
  }

  get above() {
    return this._corridors.get(this._i - SIZE);
  }

  get below() {
    return this._corridors.get(this._i + SIZE);
  }

  /**
   * Convert the room to json
   * @private
   */
  toJSON() {
    let raw = {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
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
  static _parse(i, rooms, json) {
    let room = new Room(i, json.x / BLOCK_SIZE, json.y / BLOCK_SIZE, json.w / BLOCK_SIZE, json.h / BLOCK_SIZE);

    if(json.l) {
      room._connect(rooms[i - 1], Corridor._parse(json.l));
    }

    if(json.a) {
      room._connect(rooms[i - SIZE], Corridor._parse(json.a));
    }

    return room;
  }
}

/**
 * A corridor in the maze
 * @prop {number} x The x coordinate for the corridor to start
 * @prop {number} y The y coordinate for the corridor to start
 * @prop {number} width The width of the corridor
 * @prop {number} height The height of the corridor
 * @prop {number} weight The length or width of the edge
 */
class Corridor {
  constructor(x, y, xDir, weight) {
    this._block = {x, y, weight, xDir};

    this.x = x * BLOCK_SIZE;
    this.y = y * BLOCK_SIZE;
    this._xDir = xDir;
    this.width = (xDir ? weight : 2) * BLOCK_SIZE;
    this.height = (xDir ? 2 : weight) * BLOCK_SIZE;
    this.weight = weight;
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
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  /**
   * Convert json into a Corridor
   * @private
   */
  static _parse(json) {
    let xDir = json.h / BLOCK_SIZE === 2;

    return new Corridor(
      json.x / BLOCK_SIZE, 
      json.y / BLOCK_SIZE,
      xDir,
      (xDir ? json.w : json.h) / BLOCK_SIZE
    );
  }
}

/**
 * A map for a game
 * @prop {Room[]} rooms The rooms in the dungeon
 * @prop {Map<Map<Edge>>} edges The edges/corridors in the map (Map { roomIdx => Map { roomIdx => Edge } })
 * 
 * @prop {number} BLOCK_SIZE Number of pixels of one square on the map
 */
export default class GameMap {
  constructor() {
    this.map = [];
    this.rooms = [];
  }

  /**
   * Geneate a game map
   * @returns {GameMap}
   */
  static generate() {
    let map = generateMap(generateMaze());

    map._buildMap();

    return map;
  }

  /**
   * Get a subset of the map inside rectangle specified by the coordiates
   * @param {number} xMin x coordinate for the top left corner
   * @param {number} yMin y coordinate for the top left corner
   * @param {number} xMax x coordinate for the bottom right corner
   * @param {number} yMax y coordinate for the bottom right corner
   */
  getMapFor(xMin, yMin, xMax, yMax) {
    let out = [];

    for(let y = Math.floor(yMin / BLOCK_SIZE); y < Math.ceil(yMax / BLOCK_SIZE) && y < MAX_SCREEN_WIDTH; ++y) {
      for(let x = Math.floor(xMin / BLOCK_SIZE); x < Math.ceil(xMax / BLOCK_SIZE) && x < MAX_SCREEN_WIDTH; ++x) {
        out.push({
          x: x * BLOCK_SIZE,
          y: y * BLOCK_SIZE,
          width: BLOCK_SIZE,
          height: BLOCK_SIZE,
          type: this.map[d21(x, y, MAX_SCREEN_WIDTH)]
        });
      }
    }

    return out;
  }

  /**
   * Check if a point is on the map/floor
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isOnMap(x, y) {
    let _x = Math.round(x / BLOCK_SIZE);
    let _y = Math.round(y / BLOCK_SIZE);

    return !!this.map[d21(_x, _y)];
  }

  /**
   * Generate the tile matrix based on the graph
   * @private
   */
  _buildMap() {
    this.map = [];

    for(let i = 0; i < this.rooms.length; ++i) {
      let room = this.rooms[i];
      let _room = room._block;

      // render the box
      for(let by = _room.y; by < _room.y + _room.height; ++by) {
        for(let bx = _room.x; bx < _room.x + _room.width; ++bx) {
          this.map[d21(bx, by, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
        }
      }

      // render the corridor to the box to the left
      if(room.left) {
        let edge = room.left._block;

        for(let bx = edge.x; bx <= edge.x + edge.weight; ++bx) {
          this.map[d21(bx, edge.y, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
          this.map[d21(bx, edge.y + 1, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
        }
      }
      
      // render the corridor to the box above
      if(room.above) {
        let edge = room.above._block;

        for(let by = edge.y; by <= edge.y + edge.weight; ++by) {
          this.map[d21(edge.x, by, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
          this.map[d21(edge.x + 1, by, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
        }
      }
    }
  }

  /**
   * Serialize the game map
   * @returns {string} The serialized map
   */
  serialize() {
    return JSON.stringify(this.rooms);
  }

  /**
   * Parse a previously serialized map
   * @param {string|object} json The serialized map
   * @returns {GameMap}
   */
  static parse(json) {
    let map = new GameMap();
    let raw = typeof json === "string" ? JSON.parse(json) : json;
    
    for(let i = 0; i < raw.length; ++i) {
      map.rooms.push(Room._parse(i, map.rooms, raw[i]));
    }

    map._buildMap();

    return map;
  }
}

/**
 * The basic maze generation algorithm.
 * @private
 * @returns A map of edges
 */
const generateMaze = () => {
  let unvisited = new Set();
  let corridors = new Map();
  let stack = [];

  for(let i = 0; i < NODES; ++i) {
    unvisited.add(i);
  }

  let startingPoint = Math.floor(Math.random() * unvisited.size);
  stack.push(startingPoint);

  while(stack.length) {
    let current = stack[stack.length - 1];
    let [x, y] = d12(current);
    
    // find all unvisited neighbours
    let unvisitedNeighbours = [];

    if(unvisited.has(d21(x + 1, y)) && x + 1 < SIZE) {
      unvisitedNeighbours.push(d21(x + 1, y));
    }

    if(unvisited.has(d21(x, y + 1)) && y + 1 < SIZE) {
      unvisitedNeighbours.push(d21(x, y + 1));
    }

    if(unvisited.has(d21(x - 1, y)) && x - 1 >= 0) {
      unvisitedNeighbours.push(d21(x - 1, y));
    }

    if(unvisited.has(d21(x, y - 1)) && y - 1 >= 0) {
      unvisitedNeighbours.push(d21(x, y - 1));
    }

    // all of our neighbours have been visited go back to the previous node
    if(!unvisitedNeighbours.length) {
      stack.pop();
      continue;
    }

    // visit a neighbouring cell
    let toCell = unvisitedNeighbours[Math.floor(Math.random() * unvisitedNeighbours.length)];
    unvisited.delete(toCell);

    // create the edges for the corridors
    if(!corridors.has(toCell)) {
      corridors.set(toCell, new Set());
    }

    if(!corridors.has(current)) {
      corridors.set(current, new Set());
    }

    corridors.get(toCell).add(current);
    corridors.get(current).add(toCell);

    stack.push(toCell);
  }

  return corridors;
};

/**
 * Expand the maze generated by generateMaze into something with differently sized rooms
 * @private
 * @param {*} corridors 
 * @returns {Object} rooms
 */
const generateMap = (corridors) => {
  let map = new GameMap();
  // Coords for the room we are placing
  let x = 1;
  let y = 1;
  // Height of the tallest room in this row
  let maxHeight = 0;
  // Location width and heights of all rooms
  map.rooms = [];

  // Place rooms onto the map
  for(let i = 0; i < NODES; ++i) {
    // We are at the end of this row tart a new row
    if(i % SIZE === 0 && i > 0) {
      x = 1;
      y += maxHeight + Math.floor(Math.random() * (MAX_Y_DIST - 1)) + 1;
      maxHeight = 0;
    }

    let width = 2;
    let height = 2;

    // determine if this box should be a room
    if(Math.random() < ROOM_CHANCE || corridors.get(i).size === 1) {
      width = Math.floor(Math.random() * (MAX_ROOM - MIN_ROOM)) + MIN_ROOM;
      height = Math.floor(Math.random() * (MAX_ROOM - MIN_ROOM)) + MIN_ROOM;
    }

    x += Math.max(MAX_ROOM - width, 0);

    // save for corridor rendering
    map.rooms.push(new Room(i, x, y, width, height));

    maxHeight = Math.max(height, maxHeight);

    // Render a corridor to the box to our left (if there is one)
    if(i % SIZE > 0 && corridors.get(i).has(i - 1)) {
      let room = map.rooms[i - 1];
      let box = room._block;

      // find a row that we have in common
      let sharedHeight = Math.min(box.height, height) - 1;
      let yOffset = Math.floor(Math.random() * sharedHeight);

      // Add weights to the graph
      let edge = new Corridor(box.x + box.width, y + yOffset, true, x - (box.x + box.width));

      room._connect(map.rooms[i], edge);
    }

    // Render a corridor to the box above us
    if(y > 0 && corridors.get(i).has(i - SIZE)) {
      let room = map.rooms[i - SIZE];
      let box = room._block;

      // find a column that we have in common
      let xStart = Math.max(x, box.x);
      let sharedWidth = Math.min(width - (x - xStart), box.width - (box.x - xStart)) - 1;
      let xPos = Math.floor(Math.random() * sharedWidth) + xStart;

      // Add weights to the graph
      let edge = new Corridor(xPos, box.y + box.height, false, y - (box.y + box.height));

      room._connect(map.rooms[i], edge);
    }

    x += width + 1;
  }

  return map;
};