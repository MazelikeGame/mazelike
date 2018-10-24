/*global PIXI*/
export default class PlayerList {
  constructor(listOfPlayers) {

    this.listOfPlayers = listOfPlayers;
  }

  render() {
    this._textStyle = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 17
    });

    //Draws the rectange.
    var graphics = new PIXI.Graphics();
    graphics.beginFill(0xFFFFFF);
    graphics.fillAlpha = 0.15;
    graphics.drawRect(0, 0, 200, 200);

    let title = new PIXI.Text("Players", this._textStyle);
    title.position.set(10, 5);
    graphics.addChild(title);

    graphics.position.set(10, 10);

    return graphics;
  }
}