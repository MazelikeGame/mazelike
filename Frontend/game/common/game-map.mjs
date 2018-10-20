/* eslint-disable complexity,no-extra-parens,no-mixed-operators,consistent-return */
/* global PIXI */
/** @module GameMap */

const DEFAULT_RENDERER = "tile-renderer-floor-0-1-box-big";
const MIN_SIZE = 16;

const THEMES = (() => {
  let themes = [];

  for(let i = 0; i < 3; ++i) {
    for(let j = 0; j < 8; ++j) {
      if(i < 2 && j < 5) {
        themes.push(`${i}-${j}`);
      }
    }
  }

  return themes;
})();

/**
 * Map a 2d coordinate to a 1d coordinate
 * @private
 * @param {*} x 
 * @param {*} y 
 */
const d21 = (x, y, size) => {
  return y * size + x;
};

/**
 * Map a 1d coordinate to a 2d coordinate
 * @private
 * @param {*} x 
 * @param {*} y 
 */
const d12 = (i, size) => {
  return [i % size, Math.floor(i / size)];
};

/**
 * A room in the maze
 * @prop {number} x X coordinate of the room
 * @prop {number} y Y coordinate of the room
 * @prop {number} width Width coordinate of the room
 * @prop {number} height Height coordinate of the room
 * @prop {string} type Always room
 */
class Room {
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

/**
 * A corridor in the maze
 * @prop {number} x The x coordinate for the corridor to start
 * @prop {number} y The y coordinate for the corridor to start
 * @prop {number} width The width of the corridor
 * @prop {number} height The height of the corridor
 * @prop {number} weight The weight to use for graph algorithms
 * @prop {string} type Always corridor
 */
class Corridor {
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

/**
 * A map for a game
 * @prop {string} id Unique id for this map
 * @prop {string} theme The theme for this map
 * @prop {Room[]} rooms The rooms in the map
 * @prop {Monster[]} monsters The monsters in this map
 * @prop {Item[]} items The items in this map
 * @prop {Player[]} players The players in this map
 */
export default class GameMap {
  /**
   * <span style="color: red;">Constructor is private.</span>
   * See GameMap.parse or GameMap.generate for instances of GameMap
   */
  constructor() {
    this.rooms = [];
  }

  /**
   * Initialize the map generation parameters
   * @private
   * @param params 
   */
  _initParams(params = {}) {
    this._params = {
      nodes: params.nodes || 100,
      minRoom: (params.minRoom || 16) * MIN_SIZE,
      maxRoom: (params.maxRoom || 40) * MIN_SIZE,
      maxYDist: (params.maxYDist || 12) * MIN_SIZE,
      roomChance: params.roomChange || 0.2,
      corridorSize: (params.corridorSize || 8) * MIN_SIZE,
      xPadding: (params.xPadding || 4) * MIN_SIZE,
      yPadding: (params.xPadding || 4) * MIN_SIZE,
      theme: params.theme || THEMES[Math.floor(Math.random() * THEMES.length)],
      spawn: params.spawn
    };

    if(!this._params.spawn) {
      this._params.spawn = Math.floor(Math.random() * this._params.nodes);
    }

    if(this._params.spawn >= this._params.nodes || this._params.spawn < 0) {
      throw new Error("Spawn must be less that nodes and greater than or equal to 0");
    }

    this._params.size = Math.sqrt(this._params.nodes);
    if(this._params.size !== Math.floor(this._params.size)) {
      throw new Error("nodes must be a perfect square");
    }
  }

  /**
   * Geneate a game map
   * @param {GameMap} The game map to store everything in
   * @returns {GameMap}
   */
  static generate(map, params) {
    map._initParams(params);

    map.generateMap(map.generateMaze());

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
    /* eslint-disable no-param-reassign */
    xMin = Math.max(0, xMin);
    yMin = Math.max(0, yMin);
    /* eslint-enable no-param-reassign */

    if(container.__prevXMin === xMin && container.__prevXMax === xMax && 
      container.__prevYMin === yMin && container.__prevYMax === yMax) {
      return;
    }

    container.__prevXMin = xMin;
    container.__prevXMax = xMax;
    container.__prevYMin = yMin;
    container.__prevYMax = yMax;

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

    // process a single room/corridor
    let process = (rect) => {
      let renderer = GameMap._renderers.get(rect._rendererName);

      if(!renderer) {
        renderer = GameMap._renderers.get(DEFAULT_RENDERER);
      }

      // get corrds relative to the screen
      let x = rect.x - xMin;
      let y = rect.y - yMin;
      let xEnd = x + rect.width;
      let yEnd = y + rect.height;
      let width = xEnd - x;
      let height = yEnd - y;
      // get corrds relative to the rect
      let relativeX = Math.max(x - rect.x, 0);
      let relativeY = Math.max(y - rect.y, 0);
      let relativeWidth = width - relativeX - Math.max(xEnd - xMax, 0);
      let relativeHeight = height - relativeY - Math.max(yEnd - yMax, 0);

      let sprites = renderer.render({
        x: relativeX,
        y: relativeY,
        width: relativeWidth,
        height: relativeHeight,
        rect,
        xMin,
        xMax,
        yMin,
        yMax,
        map: this
      });

      // positon and size the sprites that were given
      sprites.position.set(x, y);
      sprites.width = Math.min(xMax, xEnd) - x;
      sprites.height = Math.min(yMax, yEnd) - y;
      container.addChild(sprites);
    };

    // process all of the rooms and corridors
    for(let room of this.rooms) {
      if(inBounds(room)) {
        process(room);
      }
      
      if(room.left && inBounds(room.left)) {
        process(room.left);
      }

      if(room.above && inBounds(room.above)) {
        process(room.above);
      }
    }
  }

  /**
   * A room and corridor renderer
   * @typedef Renderer
   * @prop {string} name The name of the renderer
   * @prop {Function} canRender Can this render the room or corridor that is passed in
   * @prop {Function} render Render the actual room or corridor
   */

  /**
   * Regester a renderer for rooms and corridors
   * @param renderer {Renderer} The renderer to use 
   */
  static register(renderer) {
    GameMap._renderers.set(renderer.name, renderer);
  }

  /**
   * Create a renderer that just tiles a specific sprite
   * @param texture The texture to tile
   * @returns {Renderer}
   */
  static createTileRenderer(res, name) {
    return {
      name: `tile-renderer-${res}-${name}`,

      canRender() {
        return true;
      },

      render({x, y, width, height, map}) {
        let texture = PIXI.loader.resources[res].textures[`${map._params.theme}${name}`];
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
    };
  }

  /**
   * Check if a point is on the map/floor
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isOnMap(x, y) {
    return !!this.getRect(x, y);
  }

  /**
   * Get the room of corridor that contains the x, y corrdinate otherwise return undefined
   * @param {number} x
   * @param {number} y
   * @returns {Room|Corridor}
   */
  getRect(x, y) {
    const check = (rect) => {
      return rect.x < x && x < rect.x + rect.width &&
        rect.y < y && y < rect.y + rect.height;
    };

    for(let room of this.rooms) {
      if(check(room)) {
        return room;
      } else if(room.left && check(room.left)) {
        return room.left;
      } else if(room.above && check(room.above)) {
        return room.above;
      }
    }
  }

  /**
   * Serialize the game map
   * @returns {string} The serialized map
   */
  serialize() {
    return JSON.stringify({
      rooms: this.rooms,
      params: {
        nodes: this._params.nodes,
        minRoom: this._params.minRoom / MIN_SIZE,
        maxRoom: this._params.maxRoom / MIN_SIZE,
        maxYDist: this._params.maxYDist / MIN_SIZE,
        roomChance: this._params.roomChange,
        corridorSize: this._params.corridorSize / MIN_SIZE,
        xPadding: this._params.xPadding / MIN_SIZE,
        yPadding: this._params.xPadding / MIN_SIZE,
        theme: this._params.theme,
        spawn: this._params.spawn
      }
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

    map._initParams(raw.params);

    for(let i = 0; i < raw.rooms.length; ++i) {
      map.rooms.push(Room._parse(i, map.rooms, raw.rooms[i], map._params));
    }

    return map;
  }

  /**
   * The basic maze generation algorithm.
   * @private
   * @returns A map of edges
   */
  generateMaze() {
    let unvisited = new Set();
    let corridors = new Map();
    let stack = [];

    for(let i = 0; i < this._params.nodes; ++i) {
      unvisited.add(i);
    }

    let startingPoint = Math.floor(Math.random() * unvisited.size);
    stack.push(startingPoint);

    while(stack.length) {
      let current = stack[stack.length - 1];
      let [x, y] = d12(current, this._params.size);
      
      // find all unvisited neighbours
      let unvisitedNeighbours = [];

      if(unvisited.has(d21(x + 1, y, this._params.size)) && x + 1 < this._params.size) {
        unvisitedNeighbours.push(d21(x + 1, y, this._params.size));
      }

      if(unvisited.has(d21(x, y + 1, this._params.size)) && y + 1 < this._params.size) {
        unvisitedNeighbours.push(d21(x, y + 1, this._params.size));
      }

      if(unvisited.has(d21(x - 1, y, this._params.size)) && x - 1 >= 0) {
        unvisitedNeighbours.push(d21(x - 1, y, this._params.size));
      }

      if(unvisited.has(d21(x, y - 1, this._params.size)) && y - 1 >= 0) {
        unvisitedNeighbours.push(d21(x, y - 1, this._params.size));
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
  }

  /**
   * Expand the maze generated by generateMaze into something with differently sized rooms
   * @private
   * @param {*} corridors 
   * @returns {Object} rooms
   */
  generateMap(corridors) {
    let map = this;
    // Coords for the room we are placing
    let x = this._params.xPadding;
    let y = this._params.yPadding;
    // Height of the tallest room in this row
    let maxHeight = 0;
    // Location width and heights of all rooms
    map.rooms = [];
    let renderers = Array.from(GameMap._renderers.values());

    // Place rooms onto the map
    for(let i = 0; i < this._params.nodes; ++i) {
      // We are at the end of this row tart a new row
      if(i % this._params.size === 0 && i > 0) {
        x = this._params.xPadding;
        y += maxHeight + Math.floor(Math.random() * this._params.maxYDist) + this._params.yPadding;
        maxHeight = 0;
      }

      let width = this._params.corridorSize;
      let height = this._params.corridorSize;

      // determine if this box should be a room
      if(Math.random() < this._params.roomChance || corridors.get(i).size === 1) {
        width = Math.floor(Math.random() * (this._params.maxRoom - this._params.minRoom)) + this._params.minRoom;
        height = Math.floor(Math.random() * (this._params.maxRoom - this._params.minRoom)) + this._params.minRoom;
      }

      x += Math.max(this._params.maxRoom - width, 0);
      
      // save for corridor rendering
      let newRoom = new Room(i, x, y, width, height, this._params);
      map.rooms.push(newRoom);

      // pick a renderer
      let renderer;
      do {
        renderer = renderers[Math.floor(Math.random() * renderers.length)];
      } while(!renderer.canRender(newRoom));

      newRoom._rendererName = renderer.name;

      maxHeight = Math.max(height, maxHeight);

      // Render a corridor to the box to our left (if there is one)
      if(corridors.get(i).has(i - 1)) {
        let room = map.rooms[i - 1];

        // find a row that we have in common
        let yStart = Math.max(y, room.y);
        let sharedHeight = Math.min(height - (yStart - y), room.height - (yStart - room.y)) - this._params.corridorSize;
        let yPos = Math.floor(Math.random() * sharedHeight) + yStart;

        // Add weights to the graph
        let edge = new Corridor(
          room.x + room.width, yPos, x - (room.x + room.width), this._params.corridorSize, this._params);

        // pick a corridor renderer
        do {
          renderer = renderers[Math.floor(Math.random() * renderers.length)];
        } while(!renderer.canRender(edge));

        edge._rendererName = renderer.name;

        room._connect(map.rooms[i], edge);
      }

      // Render a corridor to the box above us
      if(corridors.get(i).has(i - this._params.size)) {
        let room = map.rooms[i - this._params.size];

        // find a column that we have in common
        let xStart = Math.max(x, room.x);
        let sharedWidth = Math.min(width - (xStart - x), room.width - (xStart - room.x)) - this._params.corridorSize;
        let xPos = Math.floor(Math.random() * sharedWidth) + xStart;

        // Add weights to the graph
        let edge = new Corridor(
          xPos, room.y + room.height, this._params.corridorSize, y - (room.y + room.height), this._params);

        // pick a corridor renderer
        do {
          renderer = renderers[Math.floor(Math.random() * renderers.length)];
        } while(!renderer.canRender(edge));

        edge._rendererName = renderer.name;

        room._connect(map.rooms[i], edge);
      }

      x += width + this._params.xPadding;
    }
  }

  get theme() {
    return this._params.theme;
  }

  /**
   * Get the spawn point for a player
   * @returns {object} {x,y}
   */
  getSpawnPoint() {
    let room = this.rooms[this._params.spawn];

    let x = room.x + Math.floor(Math.random() * (room.width * 3 / 4)) + Math.floor(room.width / 4);
    let y = room.y + Math.floor(Math.random() * (room.height * 3 / 4)) + Math.floor(room.height / 4);

    if(!this.isOnMap(x, y)) {
      throw new Error("Spawn point not on map");
    }

    return {x, y};
  }
}

GameMap._renderers = new Map();