/* eslint-disable complexity,no-mixed-operators,consistent-return */
/** @module common/game-map/GameMap */
import {MIN_SIZE, THEMES} from "./game-map-const.mjs";
import Room from "./room.mjs";
import Corridor from "./corridor.mjs";

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
 * A map for a game
 * @prop {string} id Unique id for this map
 * @prop {string} theme The theme for this map
 * @prop {Room[]} rooms The rooms in the map
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
  _initParams(params = {}, numItems = 0) {
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

    this.numItems = numItems;

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
   * @param {GameMap} map The game map to store everything in
   * @param {object} params The game map generation parameters for the game map
   * @returns {GameMap}
   */
  static generate(map, params) {
    map._initParams(params, map.numItems);

    map.generateMap(map.generateMaze());

    return map;
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
   * Check if a point is on the map/floor
   * @param {number} x
   * @param {number} y
   * @param {boolean} isMonster
   * @returns {boolean}
   */
  isOnMap(x, y, isMonster) {
    let rect = this.getRect(x, y);
    if(!rect) {
      return;
    }

    return !isMonster || !rect.noMonsters;
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
      numItems: this.numItems,
      params: {
        nodes: this._params.nodes,
        minRoom: this._params.minRoom / MIN_SIZE,
        maxRoom: this._params.maxRoom / MIN_SIZE,
        maxYDist: this._params.maxYDist / MIN_SIZE,
        roomChance: this._params.roomChange,
        corridorSize: this._params.corridorSize / MIN_SIZE,
        xPadding: this._params.xPadding / MIN_SIZE,
        yPadding: this._params.xPadding / MIN_SIZE,
        theme: this._params.theme || "0-0",
        spawn: this._params.spawn,
      }
    });
  }

  /**
   * Parse a previously serialized map
   * @param {string|object} json The serialized map
   * @param {GameMap} map The game map to use
   * @returns {GameMap}
   */
  static parse(json, map) {
    let raw = typeof json === "string" ? JSON.parse(json) : json;

    map._initParams(raw.params, raw.numItems);

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
      // We are at the end of this row start a new row
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
