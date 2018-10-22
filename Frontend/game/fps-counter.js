/* global PIXI */
/** @module FpsCounter */
let ml = window.ml || (window.ml = {});

ml.FPS_BUFFER_SIZE = 25;

/**
 * A basic fps counter
 */
export default class FpsCounter {
  constructor() {
    this._avgBuf = [];
    this._lastFrame = 0;
    
    this._textStyle = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 17
    });

    this.sprite = new PIXI.Text("Loading", this._textStyle);
  }

  /**
   * Update and render the fps counter (should be called every frame)
   */
  update() {
    let now = Date.now();
    
    if(this._lastFrame > 0) {
      this._avgBuf.push(now - this._lastFrame);
    }

    this._lastFrame = now;

    while(this._avgBuf.length > ml.FPS_BUFFER_SIZE) {
      this._avgBuf.shift();
    }

    /* eslint-disable arrow-body-style */
    let frameTime = Math.round(this._avgBuf.reduce((a, b) => a + b, 0) / this._avgBuf.length);
    /* eslint-enable arrow-body-style */

    let text = `${frameTime}ms (${Math.round(1000 / frameTime)}fps)`;
    this.sprite.setText(text);

    let metrics = PIXI.TextMetrics.measureText(text, this._textStyle);
    this.sprite.position.set(innerWidth - 10 - metrics.width, 10);
  }
}