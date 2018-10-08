/* eslint-disable complexity,no-extra-parens,no-mixed-operators */
import {dbgLog} from "./debug.js";
let debugGen = dbgLog("generator");

const BLOCK_SIZE = 48;
const SIZE = 100;

/**
 * Map a 2d coordinate to a 1d coordinate
 * @param {*} x 
 * @param {*} y 
 */
const d2 = (x, y) => {
  return y * SIZE + x;
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
  static generate(generators) {
    let map = new GameMap();
    debugGen.log("Generating map");
    let start = Date.now();
    
    for(let y = 0; y < SIZE; y++) {
      for(let x = 0; x < SIZE; x++) {
        // check if this spot is taken
        if(map.map[d2(x, y)]) {
          continue;
        }

        // try to find a generator that fits
        for(;;) {
          let generator = generators[Math.floor(Math.random() * generators.length)];

          if((generator.rarity || 1) < Math.random()) {
            continue;
          }

          let fits = true;
          
          // Check all the blocks that this generator wants to use to ensure they are empty
          for(let yf = y; yf < generator.height + y && fits; ++yf) {
            for(let xf = x; xf < generator.width + x && fits; ++xf) {
              fits = yf < SIZE &&
                xf < SIZE &&
                !map.map[d2(xf, yf)];
            }
          }

          if(!fits) {
            continue;
          }

          debugGen.log(`Using generator ${generator.name} ${generator.width}x${generator.height} at (${x}, ${y})`);
          generator.generate(map, x, y);
          break;
        }
      }
    }

    debugGen.log(`Map generated ${Date.now() - start}ms`);
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
          type: this.map[d2(x, y)]
        });
      }
    }

    return out;
  }

  set(x, y, type) {
    this.map[d2(x, y)] = type;
  }
}