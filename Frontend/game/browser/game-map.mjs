/* eslint-disable complexity,no-mixed-operators,consistent-return */
/* global PIXI */
/** @module browser/GameMap */
import GameMapCommon from "../common/game-map/game-map.mjs";

const DEFAULT_RENDERER = "smooth-renderer";

/**
 * A renderer for the entire game map
 * @typedef SpriteReturn
 * @prop {PIXI.Container} sprite The sprite representing the game map
 * @prop {Function} update GameMap.updateSprite but without the container parameter
 */
class GameMapRenderer {
  constructor(map) {
    this.map = map;
    this.sprite = new PIXI.Container();
  }

  /**
   * Render a subset of the map inside rectangle specified by the coordiates
   * @param {PIXI.Container} container The container returned by create sprite
   * @param {number} xMin x coordinate for the top left corner
   * @param {number} yMin y coordinate for the top left corner
   * @param {number} xMax x coordinate for the bottom right corner
   * @param {number} yMax y coordinate for the bottom right corner
   */
  update(xMin, yMin, xMax, yMax) {
    /* eslint-disable no-param-reassign */
    xMin = Math.max(0, xMin);
    yMin = Math.max(0, yMin);
    /* eslint-enable no-param-reassign */

    if(this.__prevXMin === xMin && this.__prevXMax === xMax && 
      this.__prevYMin === yMin && this.__prevYMax === yMax) {
      return;
    }

    this.__prevXMin = xMin;
    this.__prevXMax = xMax;
    this.__prevYMin = yMin;
    this.__prevYMax = yMax;

    while(this.sprite.children.length) {
      this.sprite.removeChild(this.sprite.children[0]);
    }

    // check that a rect is inside the box even partially
    let inBounds = (rect) => {
      return ((xMin <= rect.x && rect.x <= xMax) ||
        (xMin <= rect.x + rect.width && rect.x + rect.width <= xMax) ||
        (xMin > rect.x && rect.x + rect.width > xMax)) &&
        ((yMin <= rect.y && rect.y <= yMax) ||
        (yMin <= rect.y + rect.height && rect.y + rect.height <= yMax) ||
        (yMin > rect.y && rect.y + rect.height > yMax));
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
        map: this.map
      });

      // positon and size the sprites that were given
      sprites.position.set(x, y);
      sprites.width = Math.min(xMax, xEnd) - x;
      sprites.height = Math.min(yMax, yEnd) - y;
      this.sprite.addChild(sprites);
    };

    // process all of the rooms and corridors
    for(let room of this.map.rooms) {
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
}

export default class GameMap extends GameMapCommon {
  /**
   * Geneate a game map
   * @returns {GameMap}
   */
  static generate(params) {
    return GameMapCommon.generate(new GameMap(), params);
  }
  
  /**
   * Load the game map in the browser
   * @param {Floor} floor The floor to load the map for
   */
  static load(floor) {
    return fetch(`/game/map/${floor.id}`)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        floor.map = GameMap.parse(json, new GameMap());
      });
  }

  /**
   * Create a new renderer for this game map
   */
  createRenderer() {
    return new GameMapRenderer(this);
  }
}