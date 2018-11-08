/* global PIXI */
/* eslint-disable no-extra-parens,arrow-body-style */

const KEY_TRIGGER = 50; // Delay between repeated presses
const REPEAT_DELAY = 500; // Delay between initial press and repeated presses

export default class MobileControls {
  constructor() {
    this.sprite = new PIXI.Container();
    
    this._createArrow([-20, 30, 20, 30, 0, 0], 38); // up
    this._createArrow([-20, 80, 20, 80, 0, 110], 40); // down
    this._createArrow([-25, 35, -25, 75, -55, 55], 37); // left
    this._createArrow([25, 35, 25, 75, 55, 55], 39); // right
    
    this._players = new Set();
    this._timers = new Map();

    // stop all triggers when global pointer up is triggered
    addEventListener("pointerup", () => {
      // eslint-disable-next-line no-unused-vars
      for(let [_, timer] of this._timers) {
        clear(timer);
      }
    });

    this.update();
  }

  /**
   * Create a arrow for a control
   * @private
   * @param points 
   * @param keyCode 
   */
  _createArrow(points, keyCode) {
    let triangle = new PIXI.Graphics();
    triangle.beginFill(0xffffff);
    triangle.drawPolygon(points);
    triangle.endFill();
    triangle.x = 0;
    triangle.y = 0;
    triangle.interactive = true;
    triangle.buttonMode = true;
    this.sprite.addChild(triangle);
    
    triangle.on("pointerdown", () => this._start(keyCode));
    triangle.on("pointerup", () => this._stop(keyCode));
    triangle.on("pointerleave", () => this._stop(keyCode));
  }

  /**
   * Update the position of the controls
   */
  update() {
    this.sprite.x = innerWidth - (this.sprite.width / 2) - 10;
    this.sprite.y = innerHeight - this.sprite.height - 10;
  }

  /**
   * Start triggering key presses
   * @private
   * @param keyCode 
   */
  _start(keyCode) {
    clear(this._timers.get(keyCode));

    this._timers.set(keyCode, setTimeout(() => {
      this._timers.set(keyCode, setInterval(() => {
        this._trigger(keyCode);
      }, KEY_TRIGGER));
    }, REPEAT_DELAY));

    this._trigger(keyCode);
  }

  /**
   * Trigger a key press for all players
   * @private
   * @param keyCode 
   */
  _trigger(keyCode) {
    for(let fn of this._players) {
      fn({ keyCode });
    }
  }

  /**
   * Stop triggering key presses
   * @private
   * @param keyCode 
   */
  _stop(keyCode) {
    clear(this._timers.get(keyCode));
    this._timers.delete(keyCode);
  }

  /**
   * Bind an event listener for virtual key presses
   * @param fn The event listener
   */
  bind(fn) {
    this._players.add(fn);
  }

  /**
   * Unbind an event listener for virtual key presses
   * @param fn The event listener
   */
  unbind(fn) {
    this._players.delete(fn);
  }
}

function clear(timer) {
  clearInterval(timer);
  clearTimeout(timer);
}