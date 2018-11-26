/*global PIXI*/

/** @module browser/DisconnectMessage */

/**
 * A message that shows when disconnected.
 */
export default class DiconnectMessage {
  /**
   * Creates a new message with a given value.
   * @param {string} msg the message you want to send
   */
  constructor(msg) {
    this.msg = msg;
    this.graphics = new PIXI.Graphics();
    this.disconnectBox = new PIXI.Graphics();
  }

  /**
   * Renders the disconnect message.
   */
  render() {
    this.draw();
    return this.graphics;
  }

  /**
   * Resizes the disconnect box when the window is resized.
   */
  resize() {
    this.disconnectBox.position.set(window.innerWidth - 310, 10); //eslint-disable-line
  }

  /**
   * Creates the elements of the disconnect message in PIXI.
   */
  draw() {  
    //Black background with white border
    let outline = new PIXI.Graphics();
    outline.beginFill(0x000000);
    outline.fillAlpha = 0.75;
    outline.lineStyle(2, 0xFFFFFFF, 1);
    outline.drawRect(0, 0, 300, 30);
    outline.position.set(0, 0); //eslint-disable-line
    outline.endFill();
    this.disconnectBox.addChild(outline);

    this._disconnectMessageStyle = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 16
    });
    
    //Disconnect Message
    let msg = new PIXI.Text(this.msg, this._disconnectMessageStyle);
    msg.position.set(15, 5); //eslint-disable-line
    this.disconnectBox.addChild(msg);
    this.graphics.addChild(this.disconnectBox);
  }
}
