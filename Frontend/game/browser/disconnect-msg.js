/*global PIXI*/
export default class DiconnectMessage {
  constructor(msg) {
    this.msg = msg;
    this.graphics = new PIXI.Graphics();
  }

  render() {
    this.draw();
    return this.graphics;
  }

  draw() {  
    //Black background
    let outline = new PIXI.Graphics();
    outline.beginFill(0x000000);
    outline.fillAlpha = 0.75;
    outline.lineStyle(2, 0xFFFFFFF, 1);
    outline.drawRect(0, 0, 300, 30);
    outline.position.set(window.innerWidth - 310, 10); //eslint-disable-line
    outline.endFill();
    this.graphics.addChild(outline);

    this._playerNameStyle = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 16
    });
    
    //Player name
    let player = new PIXI.Text(this.msg, this._playerNameStyle);
    player.position.set(window.innerWidth - 290, 15); //eslint-disable-line
    this.graphics.addChild(player);
  }

}
