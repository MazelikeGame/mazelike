/* eslint-disable complexity,no-extra-parens */
const SIZE = 10000;

export default class GameMap {
  constructor() {
    this.map = [];
  }

  static generate() {
    let map = new GameMap();

    for(let y = 0; y < SIZE; y += 48) {
      for(let x = 0; x < SIZE; x += 48) {
        map.map.push({
          x,
          y,
          width: 48,
          height: 48,
          type: `${Math.floor(Math.random() * 2)}-${Math.floor(Math.random() * 7)}-box-big`
        });
      }
    }

    return map;
  }

  getMapFor(xMin, yMin, xMax, yMax) {
    return this.map.filter((k) => {
      let endX = k.x + k.width;
      let endY = k.y + k.height;

      return ((xMin <= k.x && k.x <= xMax) || (xMin <= endX && endX <= xMax)) &&
        ((yMin <= k.y && k.y <= yMax) || (yMin <= endY && endY <= yMax));
    });
  }
}