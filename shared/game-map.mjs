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

// The map file header
const HEADER = [
  0x4d, 0x4c, // magic
  1, // version
  0 // padding
];

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
    return Array.from(this._corridors);
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
    return Object.assign({room}, this);
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
   * <pre>
   * Serialize the game map
   * 
   * Game map format 
   * NAME    | size (in bytes)
   * magic   | 2
   * version | 1
   * --- 1 byte padding ---
   * num edges | 2 (16-bit little endian)
   * --- edges 5 bytes each ---
   * --- rooms 3 bytes each ---
   * 
   * NOTE: There are always NODES nodes in a map
   * 
   * Edge format
   * NAME         | size (in bytes)
   * from node id | 1
   * to node id   | 1
   * x            | 1
   * y            | 1
   * xDir         | 1/8 (shares this byte with weight)
   * weight       | 7/8 (offset 1 bit)
   * 
   * Room format
   * NAME       | size (in bytes)
   * x          | 1
   * y          | 1
   * width - 2  | 1/2 (shares this byte with height)
   * height - 2 | 1/2 (offset 4 bits)
   * </pre>
   * 
   * @returns {ArrayBuffer} The serialized map
   */
  serialize() {
    /* eslint-disable arrow-parens,arrow-body-style */
    let numEdges = this.rooms
      .map(room => room.corridors.length)
      .reduce((a, b) => a + b, 0);
    /* eslint-enable arrow-parens,arrow-body-style */

    let bufferLength = HEADER.length + 2 + (numEdges / 2 * 5) + (NODES * 3);
    let buffer = new ArrayBuffer(bufferLength);
    let u8 = new Uint8Array(buffer);
    let u16 = new Uint16Array(buffer, HEADER.length, HEADER.length + 2);

    HEADER.forEach((value, i) => {
      u8[i] = value;
    });

    u16[0] = numEdges / 2;

    let offset = HEADER.length + 2;

    for(let fromRoom of this.rooms) {
      for(let edge of [fromRoom.left, fromRoom.above]) {
        if(!edge) {
          continue;
        }

        let toRoom = edge.room;
        let {x, y} = edge;

        x /= BLOCK_SIZE;
        y /= BLOCK_SIZE;

        if(x > 255 || y > 255) {
          throw new Error("Edge x or y values exceded treshhold");
        }

        if(edge.weight > 127) {
          throw new Error("Edge weight value exceded threshold");
        }

        if(typeof edge._xDir !== "boolean") {
          throw new Error("Expected edge.xDir to be a boolean");
        }

        u8[offset++] = fromRoom._i;
        u8[offset++] = toRoom._i;
        u8[offset++] = x;
        u8[offset++] = y;
        u8[offset++] = (edge.weight << 1) | (+edge._xDir); // eslint-disable-line no-bitwise
      }
    }

    for(let {x, y, width, height} of this.rooms) {
      x /= BLOCK_SIZE;
      y /= BLOCK_SIZE;
      width /= BLOCK_SIZE;
      height /= BLOCK_SIZE;

      if(x > 255 || y > 255) {
        throw new Error("Room x or y values exceded treshhold");
      }

      if(width > 17 || height > 17) {
        throw new Error("Room width or height values exceded threshold");
      }

      u8[offset++] = x;
      u8[offset++] = y;
      u8[offset++] = (width - 2) | ((height - 2) << 4); // eslint-disable-line no-bitwise
    }

    if(offset !== buffer.byteLength) {
      throw new Error(`Offset does not match buffer ${offset} != ${buffer.byteLength}`);
    }

    return buffer;
  }

  /**
   * Parse a previously serialized map
   * @param {ArrayBuffer} buffer The serialized map
   * @returns {GameMap}
   */
  static parse(buffer) {
    let u8 = new Uint8Array(buffer);

    if(u8[0] !== HEADER[0] || u8[1] !== HEADER[1]) {
      throw new Error("File is not a map");
    }

    switch(u8[2]) {
    case 1:
      return v1Parse(buffer);
    
    default:
      throw new Error(`Unsupported version ${u8[2]}`);
    }
  }
}

/**
 * Map parser for version 1
 * @private
 * @param buffer The raw map
 * @returns {GameMap}
 */
function v1Parse(buffer) {
  let map = new GameMap();
  map.rooms = [];

  let u8 = new Uint8Array(buffer);
  let u16 = new Uint16Array(buffer, HEADER.length, HEADER.length + 2);
  
  let numEdges = u16[0];
  let offset = HEADER.length + 2 + (numEdges * 5);

  for(let i = 0; i < NODES; ++i) {
    let x = u8[offset++];
    let y = u8[offset++];

    let wh = u8[offset++];
    let width = (wh & 15) + 2; // eslint-disable-line no-bitwise
    let height = ((wh >> 4) & 15) + 2; // eslint-disable-line no-bitwise

    map.rooms.push(new Room(i, x, y, width, height));
  }

  offset = HEADER.length + 2;

  for(let i = 0; i < numEdges; ++i) {
    let fromRoom = map.rooms[u8[offset++]];
    let toRoom = map.rooms[u8[offset++]];

    let x = u8[offset++];
    let y = u8[offset++];

    let wd = u8[offset++];
    let xDir = !!(wd & 1); // eslint-disable-line no-bitwise
    let weight = (wd >> 1) & 127; // eslint-disable-line no-bitwise

    let edge = new Corridor(x, y, xDir, weight);

    fromRoom._connect(toRoom, edge);
  }

  map._buildMap();

  return map;
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
 * @returns {Object} {edges, boxes}
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