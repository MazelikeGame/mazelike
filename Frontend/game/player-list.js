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

    var graphics = new PIXI.Graphics();
    
    //BACKGROUND
    graphics.beginFill(0xFFFFFF);
    graphics.fillAlpha = 0.15;
    graphics.drawRect(0, 0, 250, 200);
    graphics.position.set(10, 10);
    graphics.endFill();

    //TITLE
    let title = new PIXI.Text("Players", this._textStyle);
    title.position.set(10, 5);
    graphics.addChild(title);

    //PLAYER NAME
    let player = new PIXI.Text("CSurfus", this._textStyle);
    player.position.set(10, 30);
    graphics.addChild(player);

    var health2 = new PIXI.Graphics();
    health2.beginFill(0xFF0000);
    health2.drawRect(0, 0, 100, 10);
    health2.position.set(140, 37);
    health2.endFill();

    graphics.addChild(health2);

    //HP BOX
    var health = new PIXI.Graphics();
    health.beginFill(0x7CFC00);
    health.drawRect(0, 0, 0, 10);
    health.position.set(140, 37);
    health.endFill();

    graphics.addChild(health);

    //HP TEXT
    this._hpTextStyle = new PIXI.TextStyle({
      fill: "#000000",
      fontSize: 9
    });

    let HP_TEXT = new PIXI.Text("100", this._hpTextStyle);
    HP_TEXT.position.set(180, 37);
    graphics.addChild(HP_TEXT);

    return graphics;
  }
}