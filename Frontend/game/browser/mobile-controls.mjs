/* global PIXI */
/* eslint-disable no-extra-parens,arrow-body-style */

export default class MobileControls {
  constructor() {
    this.sprite = new PIXI.Container();
    this._players = new Set();
    this._timers = new Map();
    this._arrowName = {};
    
    this._createArrow("up", [-20, 30, 20, 30, 0, 0], [-24, -4, 46, 36], 38);
    this._createArrow("down", [-20, 80, 20, 80, 0, 110], [-24, 76, 46, 36], 40);
    this._createArrow("left", [-25, 35, -25, 75, -55, 55], [-59, 31, 36, 46], 37);
    this._createArrow("right", [25, 35, 25, 75, 55, 55], [21, 31, 36, 46], 39);
    
    this._players = new Set();

    this.update();
  }

  /**
   * Create a arrow for a control
   * @private
   * @param name
   * @param points 
   * @param keyCode 
   */
  _createArrow(name, points, rect, keyCode) {
    let triangle = new PIXI.Graphics();
    triangle.alpha = 0.5;
    triangle.beginFill(0xffffff);
    triangle.drawRect(rect[0], rect[1], rect[2], rect[3]);
    triangle.endFill();
    triangle.beginFill(0x0);
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

    this._arrowName[name] = triangle;
  }

  /**
   * Update the position of the controls
   */
  update() {
    this.sprite.x = 10 + (this.sprite.width / 2);
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

  /**
   * Hide up down arrow keys
   */
  becomeSpectator() {
    this.sprite.removeChild(this._arrowName.left);
    this.sprite.removeChild(this._arrowName.right);
  }
}
