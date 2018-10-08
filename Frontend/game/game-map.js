/* eslint-disable complexity,no-extra-parens,no-mixed-operators */
// import {dbgLog} from "./debug.js";
// let debugGen = dbgLog("generator");

const BLOCK_SIZE = 16;
let SIZE = 20;

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
    let unvisited = new Set();
    let corridors = new Map();
    let stack = [];

    for(let i = 0; i < SIZE ** 2; ++i) {
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

    SIZE *= 2;

    for(let i = 0; i < (SIZE / 2) ** 2; ++i) {
      let [x, y] = d12(i, SIZE / 2);
      x *= 2;
      y *= 2;
      map.map[d21(x, y)] = "0-0-box-small";

      /* eslint-disable max-len */
      map.map[d21(x + 1, y)] = (corridors.get(i) || new Set()).has(d21(x / 2 + 1, y / 2, SIZE / 2)) ? "0-1-box-small" : "";
      map.map[d21(x, y + 1)] = (corridors.get(i) || new Set()).has(d21(x / 2, y / 2 + 1, SIZE / 2)) ? "0-1-box-small" : "";
      /* eslint-enable max-len */
    }

    return map;
  }

  getMapFor(xMin, yMin, xMax, yMax) {
    let out = [];

    for(let y = Math.floor(yMin / BLOCK_SIZE); y < Math.ceil(yMax / BLOCK_SIZE) && y < SIZE; ++y) {
      for(let x = Math.floor(xMin / BLOCK_SIZE); x < Math.ceil(xMax / BLOCK_SIZE) && x < SIZE; ++x) {
        out.push({
          x: x * BLOCK_SIZE,
          y: y * BLOCK_SIZE,
          width: BLOCK_SIZE,
          height: BLOCK_SIZE,
          type: this.map[d21(x, y)]
        });
      }
    }

    return out;
  }
}