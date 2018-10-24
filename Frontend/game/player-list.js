/*global PIXI*/
export default class PlayerList {
  constructor(listOfPlayers) {

    this.listOfPlayers = listOfPlayers;

    this._textStyle = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 17
    });

    this.sprite = new PIXI.Text("Testing", this._textStyle);
    this.sprite.position.set(10, 10);

    let temp = new PIXI.Graphics(false);
    temp.lineStyle(2, 0xFF00FF, 1);
    temp.beginFill(0xFF00BB, 0.25);
    temp.drawRoundedRect(150, 450, 300, 100, 15);
    temp.endFill();
  }
}