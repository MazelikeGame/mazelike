/* eslint-disable complexity,no-extra-parens,no-mixed-operators */

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
 * @param {*} x 
 * @param {*} y 
 */
const d21 = (x, y, size = SIZE) => {
  return y * size + x;
};

const d12 = (i, size = SIZE) => {
  return [i % size, Math.floor(i / size)];
};

/**
 * A map for a game
 */
export default class GameMap {
  constructor() {
    this.map = [];
  }

  /**
   * Geneate a game map
   * @param {Array} generators The generators for creating sections of the map
   */
  static generate() {
    let map = new GameMap();
    
    Object.assign(map, generateMap(generateMaze()));

    map._buildMap();

    return map;
  }

  /**
   * Get a subset of the map inside rectangle specified by the coordiates
   * @param {*} xMin 
   * @param {*} yMin 
   * @param {*} xMax 
   * @param {*} yMax 
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
   * Generate the tile matrix based on the graph
   */
  _buildMap() {
    this.map = [];

    for(let i = 0; i < this.boxes.length; ++i) {
      let box = this.boxes[i];

      // render the box
      for(let by = box.y; by < box.y + box.height; ++by) {
        for(let bx = box.x; bx < box.x + box.width; ++bx) {
          this.map[d21(bx, by, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
        }
      }

      // render the corridor to the box to the left
      if(i % SIZE > 0 && this.edges[i][i - 1]) {
        let edge = this.edges[i][i - 1];

        for(let bx = edge.x; bx <= edge.x + edge.weight; ++bx) {
          this.map[d21(bx, edge.y, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
          this.map[d21(bx, edge.y + 1, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
        }
      }
      
      // render the corridor to the box above
      if(i >= SIZE && this.edges[i][i - SIZE]) {
        let edge = this.edges[i][i - SIZE];

        for(let by = edge.y; by <= edge.y + edge.weight; ++by) {
          this.map[d21(edge.x, by, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
          this.map[d21(edge.x + 1, by, MAX_SCREEN_WIDTH)] = BLOCK_TYPE;
        }
      }
    }
  }

  /**
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
   * 
   * @returns {ArrayBuffer} The serialized map
   */
  serialize() {
    /* eslint-disable arrow-parens,arrow-body-style */
    let numEdges = Object.keys(this.edges)
      .map(edge => Object.keys(this.edges[edge]).length)
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

    for(let fromNode of Object.keys(this.edges)) {
      for(let toNode of [fromNode - 1, fromNode - SIZE]) {
        let edge = this.edges[fromNode][toNode];

        if(!edge) {
          continue;
        }

        if(edge.x > 255 || edge.y > 255) {
          throw new Error("Edge x or y values exceded treshhold");
        }

        if(edge.weight > 128) {
          throw new Error("Edge weight value exceded threshold");
        }

        if(typeof edge.xDir !== "boolean") {
          throw new Error("Expected edge.xDir to be a boolean");
        }

        u8[offset++] = +fromNode;
        u8[offset++] = +toNode;
        u8[offset++] = edge.x;
        u8[offset++] = edge.y;
        u8[offset++] = (edge.weight << 1) | (+edge.xDir); // eslint-disable-line no-bitwise
      }
    }

    for(let room of this.boxes) {
      if(room.x > 255 || room.y > 255) {
        throw new Error("Room x or y values exceded treshhold");
      }

      if(room.width > 17 || room.height > 17) {
        throw new Error("Room width or height values exceded threshold");
      }

      u8[offset++] = room.x;
      u8[offset++] = room.y;
      u8[offset++] = (room.width - 2) | ((room.height - 2) << 4); // eslint-disable-line no-bitwise
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
 * @param buffer The raw map
 * @returns {GameMap}
 */
function v1Parse(buffer) {
  let map = new GameMap();
  map.edges = {};
  map.boxes = [];

  let u8 = new Uint8Array(buffer);
  let u16 = new Uint16Array(buffer, HEADER.length, HEADER.length + 2);
  let offset = HEADER.length + 2;

  let numEdges = u16[0];

  for(let i = 0; i < numEdges; ++i) {
    let fromNode = u8[offset++];
    let toNode = u8[offset++];

    let edge = {
      x: u8[offset++],
      y: u8[offset++]
    };

    let wd = u8[offset++];
    edge.xDir = !!(wd & 1); // eslint-disable-line no-bitwise
    edge.weight = (edge.weight >> 1) & 128; // eslint-disable-line no-bitwise

    /* eslint-disable no-unused-expressions */
    map.edges[fromNode] || (map.edges[fromNode] = {});
    map.edges[toNode] || (map.edges[toNode] = {});
    /* eslint-enable no-unused-expressions */

    map.edges[fromNode][toNode] = edge;
    map.edges[toNode][fromNode] = edge;
  }

  for(let i = 0; i < NODES; ++i) {
    let room = {
      x: u8[offset++],
      y: u8[offset++]
    };

    let wh = u8[offset++];
    room.width = (wh & 15) + 2; // eslint-disable-line no-bitwise
    room.height = ((wh >> 4) & 15) + 2; // eslint-disable-line no-bitwise

    map.boxes.push(room);
  }

  return map;
}

/**
 * The basic maze generation algorithm.
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
 * @param {*} corridors 
 * @returns {edges, boxes}
 */
const generateMap = (corridors) => {
  // Coords for the room we are placing
  let x = 1;
  let y = 1;
  // Height of the tallest room in this row
  let maxHeight = 0;
  // Location width and heights of all boxes
  let boxes = [];
  // More detailed edge representations
  let edges = {};

  // Place boxes/rooms onto the map
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
    boxes.push({x, y, width, height});

    maxHeight = Math.max(height, maxHeight);

    // Render a corridor to the box to our left (if there is one)
    if(i % SIZE > 0 && corridors.get(i).has(i - 1)) {
      let box = boxes[i - 1];

      // find a row that we have in common
      let sharedHeight = Math.min(box.height, height) - 1;
      let yOffset = Math.floor(Math.random() * sharedHeight);

      // Add weights to the graph
      let edge = {
        weight: x - (box.x + box.width),
        xDir: true,
        x: box.x + box.width,
        y: y + yOffset
      };

      /* eslint-disable no-unused-expressions */
      edges[i] || (edges[i] = {});
      edges[i - 1] || (edges[i - 1] = {});
      /* eslint-enable no-unused-expressions */

      edges[i][i - 1] = edge;
      edges[i - 1][i] = edge;
    }

    // Render a corridor to the box above us
    if(y > 0 && corridors.get(i).has(i - SIZE)) {
      let box = boxes[i - SIZE];

      // find a column that we have in common
      let xStart = Math.max(x, box.x);
      let sharedWidth = Math.min(width - (x - xStart), box.width - (box.x - xStart)) - 1;
      let xPos = Math.floor(Math.random() * sharedWidth) + xStart;

      // Add weights to the graph
      let edge = {
        weight: y - (box.y + box.height),
        xDir: false,
        x: xPos,
        y: box.y + box.height
      };

      /* eslint-disable no-unused-expressions */
      edges[i] || (edges[i] = {});
      edges[i - SIZE] || (edges[i - SIZE] = {});
      /* eslint-enable no-unused-expressions */

      edges[i][i - SIZE] = edge;
      edges[i - SIZE][i] = edge;
    }

    x += width + 1;
  }

  return {edges, boxes};
};