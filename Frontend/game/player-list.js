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
    let count = 0; //Fix this and just get index from foreach
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

    //Black background
    let outline = new PIXI.Graphics();
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
    
    //Player name
    let player = new PIXI.Text(this.checkNameLength(playerName), this._playerNameStyle);
    player.position.set(35, 15 + (id * offset)); //eslint-disable-line
    this.graphics.addChild(player);

    //Health bar red
    let healthRedBar = new PIXI.Graphics();
    healthRedBar.beginFill(0xFF0000);
    healthRedBar.drawRect(0, 0, 100, 10);
    healthRedBar.position.set(200, 15 + (id * offset)); //eslint-disable-line
    healthRedBar.endFill();

    this.graphics.addChild(healthRedBar);

    //Health bar green
    let healthGreenBar = new PIXI.Graphics();
    healthGreenBar.beginFill(0x7CFC00);
    healthGreenBar.drawRect(0, 0, playerHP, 10);
    healthGreenBar.position.set(200, 15 + (id * offset));//eslint-disable-line
    healthGreenBar.endFill();

    this.graphics.addChild(healthGreenBar);

    //Health Text (Health: 100)
    this._hpTextStyle = new PIXI.TextStyle({
      fill: "#FFFFFF",
      fontSize: 12
    });

    let healthText = new PIXI.Text("Health: " + playerHP, this._hpTextStyle); //eslint-disable-line
    healthText.position.set(200, 25 + (id * offset)); //eslint-disable-line
    this.graphics.addChild(healthText);
  }

  /**
   * Checks the player's name length.
   * @param {string} playerName 
   */
  checkNameLength(playerName) {
    if(playerName.length >= 18) {
      playerName = playerName.substring(0, 18) + "..."; //eslint-disable-line
    }

    return playerName;
  }
}