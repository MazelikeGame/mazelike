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
const CORRIDOR_SIZE = 2 * BLOCK_SIZE;
const X_PADDING = BLOCK_SIZE;
const Y_PADDING = BLOCK_SIZE;

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
 * @prop {number} x X coordinate of the room
 * @prop {number} y Y coordinate of the room
 * @prop {number} width Width coordinate of the room
 * @prop {number} height Height coordinate of the room
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
    return this._corridors.get(this._i - SIZE);
  }

  /**
   * Get the room below this one (if one exists)
   * @return {Room}
   */
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
 * @prop {number} weight The weight to use for graph algorithms
 */
class Corridor {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.weight = this.width === CORRIDOR_SIZE ? this.height : this.width;
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
 * @prop {Room[]} rooms The rooms in the map
 * @prop {Monster[]} monsters The monsters in this map
 * @prop {Item[]} items The items in this map
 * @prop {Player[]} players The players in this map
 */
export default class GameMap {
  constructor() {
    this.id = `game-id-here`;
    this.rooms = [];
    this.monsters = [];
    this.items = [];
    this.players = [];
  }

  _init() {
    //Monster.initMonsters(this);
  }

  /**
   * Geneate a game map
   * @returns {GameMap}
   */
  static generate() {
    let map = generateMap(generateMaze());

    map._init();

    return map;
  }

  /**
   * Container+update method
   * @typedef SpriteReturn
   * @prop {PIXI.Container} sprite The sprite representing the game map
   * @prop {Function} update GameMap.updateSprite but without the container parameter
   */

  /**
   * Create an object containing a PIXI.Container (called sprite) and an update
   * method to update the container.  Note the update method is GameMap.updateSprite
   * but without the container parameter.
   * @returns {SpriteReturn}
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

    // check that a rect is inside the box even partially
    let inBounds = (rect) => {
      return ((xMin <= rect.x && rect.x <= xMax) ||
        (xMin <= rect.x + rect.width && rect.x + rect.width <= xMax)) &&
        ((yMin <= rect.y && rect.y <= yMax) ||
        (yMin <= rect.y + rect.height && rect.y + rect.height <= yMax));
    };

    // get the size of a rect that is out of bounds
    const soob = (pos, bound, boundType) => {
      return pos - Math[boundType](bound, pos);
    };

    // process a single room/corridor
    let process = (rect, direction) => {
      let x = Math.max(rect.x - xMin, 0);
      let y = Math.max(rect.y - yMin, 0);
      let xEnd = rect.x + rect.width;
      let yEnd = rect.y + rect.height;
      let relativeX = soob(rect.x, xMin, "max");
      let relativeY = soob(rect.y, yMin, "max");
      let width = rect.width - relativeX - soob(xEnd, xMax, "min");
      let height = rect.height - relativeY - soob(yEnd, yMax, "min");

      let texture = PIXI.loader.resources.floor.textures[BLOCK_TYPE];
      let sprites = GameMap._tileRectWithSprite(relativeX, relativeY, width, height, texture, direction);

      // positon and size the sprites that were given
      sprites.position.set(x, y);
      sprites.width = width;
      sprites.height = height;
      container.addChild(sprites);
    };

    // process all of the rooms and corridors
    for(let room of this.rooms) {
      if(inBounds(room)) {
        process(room);
      }
      
      if(room.left && inBounds(room.left)) {
        process(room.left, "x");
      }

      if(room.above && inBounds(room.above)) {
        process(room.above, "y");
      }
    }
  }

  static _tileRectWithSprite(x, y, width, height, texture) {
    let {width: tWidth, height: tHeight} = texture.frame;
    let container = new PIXI.Container();

    for(let i = 0; i < width; i += tWidth) {
      for(let j = 0; j < height; j += tHeight) {
        let sprite = new PIXI.Sprite(texture);

        sprite.position.set(i - x, j - y);
        sprite.width = tWidth;
        sprite.height = tHeight;
        container.addChild(sprite);
      }
    }

    return container;
  }

  /**
   * Check if a point is on the map/floor
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isOnMap(x, y) {
    const check = (rect) => {
      return rect.x <= x && x <= rect.x + rect.width &&
        rect.y <= y && y <= rect.y + rect.height;
    };

    return !!this.rooms.find((room) => {
      return check(room) ||
        (room.left && check(room.left)) ||
        (room.above && check(room.above));
    });
  }

  /**
   * Serialize the game map
   * @returns {string} The serialized map
   */
  serialize() {
    return JSON.stringify({
      rooms: this.rooms
    });
  }

  /**
   * Parse a previously serialized map
   * @param {string|object} json The serialized map
   * @returns {GameMap}
   */
  static parse(json) {
    let map = new GameMap();
    let raw = typeof json === "string" ? JSON.parse(json) : json;

    for(let i = 0; i < raw.rooms.length; ++i) {
      map.rooms.push(Room._parse(i, map.rooms, raw.rooms[i]));
    }

    map._init();

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
      y += maxHeight + Math.floor(Math.random() * MAX_Y_DIST) + Y_PADDING;
      maxHeight = 0;
    }

    let width = CORRIDOR_SIZE;
    let height = CORRIDOR_SIZE;

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
    if(corridors.get(i).has(i - 1)) {
      let room = map.rooms[i - 1];

      // find a row that we have in common
      let yStart = Math.max(y, room.y);
      let sharedHeight = Math.min(height - (yStart - y), room.height - (yStart - room.y)) - CORRIDOR_SIZE;
      let yPos = Math.floor(Math.random() * sharedHeight) + yStart;

      // Add weights to the graph
      let edge = new Corridor(room.x + room.width, yPos, x - (room.x + room.width), CORRIDOR_SIZE);

      room._connect(map.rooms[i], edge);
    }

    // Render a corridor to the box above us
    if(corridors.get(i).has(i - SIZE)) {
      let room = map.rooms[i - SIZE];

      // find a column that we have in common
      let xStart = Math.max(x, room.x);
      let sharedWidth = Math.min(width - (xStart - x), room.width - (xStart - room.x)) - CORRIDOR_SIZE;
      let xPos = Math.floor(Math.random() * sharedWidth) + xStart;

      // Add weights to the graph
      let edge = new Corridor(xPos, room.y + room.height, CORRIDOR_SIZE, y - (room.y + room.height));

      room._connect(map.rooms[i], edge);
    }

    x += width + X_PADDING;
  }

  return map;
};