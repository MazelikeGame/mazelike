/* eslint-disable complexity,no-extra-parens,no-mixed-operators,consistent-return */
/* global PIXI */
/** @module GameMap */

const BLOCK_SIZE = 48;
const BLOCK_TYPE = "0-1-box-big";
const SIZE = 10;
const NODES = SIZE ** 2;
const MIN_ROOM = 4 * BLOCK_SIZE;
const MAX_ROOM = 10 * BLOCK_SIZE;
const MAX_Y_DIST = 3 * BLOCK_SIZE;
const ROOM_CHANCE = 0.2;
const MAX_SCREEN_WIDTH = SIZE * ((MAX_ROOM + MAX_Y_DIST) / BLOCK_SIZE);
const CORRIDOR_SIZE = 2 * BLOCK_SIZE;
const X_PADDING = BLOCK_SIZE;
const Y_PADDING = BLOCK_SIZE;

// custom floor
const floor = (x) => {
  return Math.floor(x / 48) * 48;
};

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
    this._i = i;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  
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
    let room = new Room(i, json.x, json.y, json.w, json.h);

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
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
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
    return new Corridor(json.x, json.y, json.w, json.h);
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
    this._map = [];
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
   * Create an object containing a PIXI.Container (called sprite) and an update
   * method to update the container.  Note the update method is GameMap.updateSprite
   * but without the container parameter.
   */
  createSprite() {
    let sprite = new PIXI.Container();

    return {
      sprite,
      update: this.updateSprite.bind(this, sprite)
    };
  }

  /**
   * Get a subset of the map inside rectangle specified by the coordiates
   * @param {PIXI.Container} container The container returned by create sprite
   * @param {number} xMin x coordinate for the top left corner
   * @param {number} yMin y coordinate for the top left corner
   * @param {number} xMax x coordinate for the bottom right corner
   * @param {number} yMax y coordinate for the bottom right corner
   */
  updateSprite(container, xMin, yMin, xMax, yMax) {
    while(container.children.length) {
      container.removeChild(container.children[0]);
    }

    for(let y = Math.floor(yMin / BLOCK_SIZE); y < Math.ceil(yMax / BLOCK_SIZE) && y < MAX_SCREEN_WIDTH; ++y) {
      for(let x = Math.floor(xMin / BLOCK_SIZE); x < Math.ceil(xMax / BLOCK_SIZE) && x < MAX_SCREEN_WIDTH; ++x) {
        let sprite = new PIXI.Sprite(PIXI.loader.resources.floor.textures[this._map[d21(x, y, MAX_SCREEN_WIDTH)]]);

        sprite.position.set((x * BLOCK_SIZE) - xMin, (y * BLOCK_SIZE) - yMin);
        sprite.width = BLOCK_SIZE;
        sprite.height = BLOCK_SIZE;
        container.addChild(sprite);
      }
    }
  }

  /**
   * Check if a point is on the map/floor
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isOnMap(x, y) {
    let _x = Math.floor(x / BLOCK_SIZE);
    let _y = Math.floor(y / BLOCK_SIZE);

    return !!this._map[d21(_x, _y, MAX_SCREEN_WIDTH)];
  }

  /**
   * Generate the tile matrix based on the graph
   * @private
   */
  _buildMap() {
    this._map = [];

    for(let i = 0; i < this.rooms.length; ++i) {
      let room = this.rooms[i];

      // render the box
      let yEnd = (room.y + room.height) / BLOCK_SIZE;
      let xEnd = (room.x + room.width) / BLOCK_SIZE;

      for(let by = room.y / BLOCK_SIZE; by < yEnd; ++by) {
        for(let bx = room.x / BLOCK_SIZE; bx < xEnd; ++bx) {
          this._map[d21(bx, by, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
        }
      }

      // render the corridor to the box to the left
      if(room.left) {
        let edge = room.left;
        let eXEnd = (edge.x + edge.width) / BLOCK_SIZE;
        let y = edge.y / BLOCK_SIZE;

        for(let bx = edge.x / BLOCK_SIZE; bx <= eXEnd; ++bx) {
          this._map[d21(bx, y, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
          this._map[d21(bx, y + 1, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
        }
      }
      
      // render the corridor to the box above
      if(room.above) {
        let edge = room.above;
        let eYEnd = (edge.y + edge.height) / BLOCK_SIZE;
        let x = edge.x / BLOCK_SIZE;

        for(let by = edge.y / BLOCK_SIZE; by <= eYEnd; ++by) {
          this._map[d21(x, by, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
          this._map[d21(x + 1, by, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
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
  let x = X_PADDING;
  let y = Y_PADDING;
  // Height of the tallest room in this row
  let maxHeight = 0;
  // Location width and heights of all rooms
  map.rooms = [];

  // Place rooms onto the map
  for(let i = 0; i < NODES; ++i) {
    // We are at the end of this row tart a new row
    if(i % SIZE === 0 && i > 0) {
      x = X_PADDING;
      y += maxHeight + floor(Math.random() * MAX_Y_DIST) + Y_PADDING;
      maxHeight = 0;
    }

    let width = CORRIDOR_SIZE;
    let height = CORRIDOR_SIZE;

    // determine if this box should be a room
    if(Math.random() < ROOM_CHANCE || corridors.get(i).size === 1) {
      width = floor(Math.random() * (MAX_ROOM - MIN_ROOM)) + MIN_ROOM;
      height = floor(Math.random() * (MAX_ROOM - MIN_ROOM)) + MIN_ROOM;
    }

    x += Math.max(MAX_ROOM - width, 0);
    
    // save for corridor rendering
    map.rooms.push(new Room(i, x, y, width, height));

    maxHeight = Math.max(height, maxHeight);

    // Render a corridor to the box to our left (if there is one)
    if(corridors.get(i).has(i - 1)) {
      let room = map.rooms[i - 1];

      // find a row that we have in common
      let yStart = Math.max(y, room.y);
      let sharedHeight = Math.min(height - (y - yStart), room.height - (room.y - yStart)) - BLOCK_SIZE;
      let yPos = floor(Math.random() * sharedHeight) + yStart;

      // Add weights to the graph
      let edge = new Corridor(room.x + room.width, yPos, x - (room.x + room.width), CORRIDOR_SIZE);

      room._connect(map.rooms[i], edge);
    }

    // Render a corridor to the box above us
    if(corridors.get(i).has(i - SIZE)) {
      let room = map.rooms[i - SIZE];

      // find a column that we have in common
      let xStart = Math.max(x, room.x);
      let sharedWidth = Math.min(width - (x - xStart), room.width - (room.x - xStart)) - BLOCK_SIZE;
      let xPos = floor(Math.random() * sharedWidth) + xStart;

      // Add weights to the graph
      let edge = new Corridor(xPos, room.y + room.height, CORRIDOR_SIZE, y - (room.y + room.height));

      room._connect(map.rooms[i], edge);
    }

    x += width + X_PADDING;
  }

  return map;
};