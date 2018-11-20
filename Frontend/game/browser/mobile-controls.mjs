/* global PIXI */
/* eslint-disable no-extra-parens,arrow-body-style */

export default class MobileControls {
  constructor() {
    this.sprite = new PIXI.Container();
    
    this._createArrow([-20, 30, 20, 30, 0, 0], 38); // up
    this._createArrow([-20, 80, 20, 80, 0, 110], 40); // down
    this._createArrow([-25, 35, -25, 75, -55, 55], 37); // left
    this._createArrow([25, 35, 25, 75, 55, 55], 39); // right
    
    this._players = new Set();

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
    this._trigger("down", keyCode);
  }

  /**
   * Trigger a key press for all players
   * @private
   * @param type
   * @param keyCode 
   */
  _trigger(type, keyCode) {
    for(let fn of this._players) {
      fn[type]({ keyCode });
    }
  }

  /**
   * Stop triggering key presses
   * @private
   * @param keyCode 
   */
  _stop(keyCode) {
    this._trigger("up", keyCode);
  }

  /**
   * Bind an event listener for virtual key presses
   * @param down The keydown event listener
   * @param up The keyup event listener
   */
  bind(down, up) {
    this._players.add({down, up});
  }
}

function clear(timer) {
  clearInterval(timer);
  clearTimeout(timer);
}