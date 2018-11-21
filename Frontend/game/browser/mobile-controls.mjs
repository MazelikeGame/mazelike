/* global PIXI */
/* eslint-disable no-extra-parens,arrow-body-style */

export default class MobileControls {
  constructor() {
    this.sprite = new PIXI.Container();
    
    this._createArrow([-20, 30, 20, 30, 0, 0], [-24, -4, 46, 36], 38); // up
    this._createArrow([-20, 80, 20, 80, 0, 110], [-24, 76, 46, 36], 40); // down
    this._createArrow([-25, 35, -25, 75, -55, 55], [-59, 31, 36, 46], 37); // left
    this._createArrow([25, 35, 25, 75, 55, 55], [21, 31, 36, 46], 39); // right
    
    this._players = new Set();

    this.update();
  }

  /**
   * Create a arrow for a control
   * @private
   * @param points 
   * @param keyCode 
   */
  _createArrow(points, rect, keyCode) {
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
