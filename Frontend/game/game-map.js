/* eslint-disable complexity,no-extra-parens,no-mixed-operators */
const BLOCK_SIZE = 48;
const SIZE = 100;

const d2 = (x, y) => {
  return y * SIZE + x;
};

export default class GameMap {
  constructor() {
    this.map = [];
  }

  static generate(generators) {
    let map = new GameMap();
    
    for(let y = 0; y < SIZE; y++) {
      for(let x = 0; x < SIZE; x++) {
        if(map.map[d2(x, y)]) {
          continue;
        }

        for(;;) {
          let generator = generators[Math.floor(Math.random() * generators.length)];
          let fits = true;
          
          for(let yf = y; yf < generator.size.height + y && fits; ++yf) {
            for(let xf = x; xf < generator.size.width + x && fits; ++xf) {
              fits = yf < SIZE &&
                xf < SIZE &&
                !map.map[d2(xf, yf)];
            }
          }

          if(!fits) {
            continue;
          }

          generator.generate(map, x, y);
          break;
        }
      }
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