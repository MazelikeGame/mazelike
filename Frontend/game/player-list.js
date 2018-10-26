/*global PIXI*/
export default class PlayerList {

  constructor(listOfPlayers) {
    this.listOfPlayers = listOfPlayers;
    this.graphics = new PIXI.Graphics();
  }

  /**
   * Renders the player list.
   */
  render() {
    let count = 0;
    this.listOfPlayers.forEach((player) => {
      this.drawPlayerInfo(count, player, 10);
      count++;
    });

    return this.graphics;
  }

  /**
   * Updates the player list with new player information.
   */
  update() {

  }

  /**
   * Draws the player's information to the player list.
   * @param {string} playerName 
   * @param {int} playerHP 
   */
  drawPlayerInfo(id, playerName, playerHP) {  
    let offset = 40; //Space between each player information box.

    var outline = new PIXI.Graphics();
    outline.beginFill(0x000000);
    outline.fillAlpha = 0.75;
    outline.lineStyle(2, 0xFFFFFFF, 1);
    outline.drawRect(0, 0, 300, 30);
    outline.position.set(10, 10 + (id * offset)); //eslint-disable-line
    outline.endFill();
    this.graphics.addChild(outline);

    this._playerNameStyle = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 16
    });
    
    //PLAYER NAME
    let player = new PIXI.Text(this.checkNameLength(playerName), this._playerNameStyle);
    player.position.set(35, 15 + (id * offset)); //eslint-disable-line
    this.graphics.addChild(player);

    //HP RED
    var health2 = new PIXI.Graphics();
    health2.beginFill(0xFF0000);
    health2.drawRect(0, 0, 100, 10);
    health2.position.set(200, 15 + (id * offset)); //eslint-disable-line
    health2.endFill();

    this.graphics.addChild(health2);

    //HP GREEN
    var health = new PIXI.Graphics();
    health.beginFill(0x7CFC00);
    health.drawRect(0, 0, playerHP, 10);
    health.position.set(200, 15 + (id * offset));//eslint-disable-line
    health.endFill();

    this.graphics.addChild(health);

    //HP TEXT
    this._hpTextStyle = new PIXI.TextStyle({
      fill: "#FFFFFF",
      fontSize: 12
    });

    let HP_TEXT = new PIXI.Text("Health: " + playerHP, this._hpTextStyle); //eslint-disable-line
    HP_TEXT.position.set(200, 25 + (id * offset)); //eslint-disable-line
    this.graphics.addChild(HP_TEXT);
  }

  /**
   * Checks the player's name length.
   * @param {string} playerName 
   */
  checkNameLength(playerName) {
    if(playerName.length > 18) {
      playerName = playerName.substring(0, 18) + "..."; //eslint-disable-line
    }

    return playerName;
  }
}