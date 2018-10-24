/*global PIXI*/
export default class PlayerList {

  constructor(listOfPlayers) {
    this.listOfPlayers = listOfPlayers;
    this.graphics = new PIXI.Graphics();
  }

  render() {
    this.listOfPlayers.forEach((player) => {
      this.addPlayer(player, 100);
    });

    return this.graphics;
  }

  addPlayer(playerName, playerHP) {  
    this._textStyle = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 17
    });
    
    //BACKGROUND
    this.graphics.beginFill(0xFFFFFF);
    this.graphics.fillAlpha = 0.15;
    this.graphics.drawRect(0, 0, 250, 200);
    this.graphics.position.set(10, 10);
    this.graphics.endFill();

    //TITLE
    let title = new PIXI.Text("Players", this._textStyle);
    title.position.set(10, 5);
    this.graphics.addChild(title);

    //PLAYER NAME
    let player = new PIXI.Text(playerName, this._textStyle);
    player.position.set(10, 30);
    this.graphics.addChild(player);

    var health2 = new PIXI.Graphics();
    health2.beginFill(0xFF0000);
    health2.drawRect(0, 0, 100, 10);
    health2.position.set(140, 37);
    health2.endFill();

    this.graphics.addChild(health2);

    //HP BOX
    var health = new PIXI.Graphics();
    health.beginFill(0x7CFC00);
    health.drawRect(0, 0, playerHP, 10);
    health.position.set(140, 37);
    health.endFill();

    this.graphics.addChild(health);

    //HP TEXT
    this._hpTextStyle = new PIXI.TextStyle({
      fill: "#000000",
      fontSize: 9
    });

    let HP_TEXT = new PIXI.Text(playerHP, this._hpTextStyle);
    HP_TEXT.position.set(190, 37);
    this.graphics.addChild(HP_TEXT);
  }
}