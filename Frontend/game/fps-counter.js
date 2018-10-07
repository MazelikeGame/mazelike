/* global PIXI */

let ml = window.ml || (window.ml = {});

ml.FPS_BUFFER_SIZE = 10;

export default class FpsCounter {
  constructor() {
    this._avgBuf = [];
    this._lastFrame = 0;
    this._text = new PIXI.Text("Loading");
    this._text.position.set(10, 10);
  }

  render(app) {
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

    this._text.setText(`${frameTime}ms (${Math.round(1000 / frameTime)}fps)`);

    app.stage.removeChild(this._text);
    app.stage.addChild(this._text);
  }
}