/*global PIXI*/

/**
 * A list of players that displays information about each player.
 */
export default class PlayerList {

  constructor() {
    this.floor = null;
    this.listOfPlayers = [];
    this.graphics = new PIXI.Graphics();
    this.playerBoxes = new Map();
  }

  /**
   * Renders the player list.
   */
  render() {
    this.listOfPlayers.forEach((player, index) => {
      this.drawPlayerInfo(index, player, 50); //In the future change the health here.
    });

    return this.graphics;
  }

  /**
   * Draws the player's information to the player list.
   * @param {int} id the index of the player
   * @param {string} playerName the name of the player
   * @param {string} playerHP the health of the player
   */
  drawPlayerInfo(id, playerName, playerHP) {  
    let playerBox = new PIXI.Graphics();
    let offset = 40; //Space between each player information box.

    //Black background
    let outline = new PIXI.Graphics();
    outline.beginFill(0x000000);
    outline.fillAlpha = 0.75;
    outline.lineStyle(2, 0xFFFFFFF, 1);
    outline.drawRect(0, 0, 300, 30);
    outline.position.set(10, 10 + (id * offset)); //eslint-disable-line
    outline.endFill();
    playerBox.addChild(outline);

    this._playerNameStyle = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 16
    });
    
    //Player name
    let player = new PIXI.Text(this.checkNameLength(playerName), this._playerNameStyle);
    player.position.set(35, 15 + (id * offset)); //eslint-disable-line
    playerBox.addChild(player);

    //Health bar red
    let healthRedBar = new PIXI.Graphics();
    healthRedBar.beginFill(0xFF0000);
    healthRedBar.drawRect(0, 0, 100, 10);
    healthRedBar.position.set(200, 15 + (id * offset)); //eslint-disable-line
    healthRedBar.endFill();

    playerBox.addChild(healthRedBar);

    //Health bar green
    let healthGreenBar = new PIXI.Graphics();
    healthGreenBar.beginFill(0x7CFC00);
    healthGreenBar.drawRect(0, 0, playerHP, 10);
    healthGreenBar.position.set(200, 15 + (id * offset));//eslint-disable-line
    healthGreenBar.endFill();

    playerBox.addChild(healthGreenBar);

    //Health Text (Health: 100)
    this._hpTextStyle = new PIXI.TextStyle({
      fill: "#FFFFFF",
      fontSize: 12
    });

    let healthText = new PIXI.Text("Health: " + playerHP, this._hpTextStyle); //eslint-disable-line
    healthText.position.set(200, 25 + (id * offset)); //eslint-disable-line
    playerBox.addChild(healthText);


    this.graphics.addChild(playerBox);
    this.playerBoxes.set(playerName, playerBox); //Stores the playerBox for future access accessible by username.
  }

  /**
   * Updates the player list.
   */
  update() {
    this.floor.players.forEach((player) => {
      //console.log(player.name);
    });
  }

  /**
   * Removes the player from the list
   * @param {string} username 
   */
  removePlayer(username) {
    this.listOfPlayers.splice(this.listOfPlayers.indexOf(username), 1);
  }

  /**
   * Updates the player list to show a player disconnected.
   * @param {string} username 
   */
  disconnectPlayer(username) {
    let tempPlayerBox = this.playerBoxes.get(username);
    tempPlayerBox.alpha = 0.35;
  }

  /**
   * Checks the player's name length.
   * @param {string} playerName the name of player you want to check
   */
  checkNameLength(playerName) {
    if(playerName.length >= 18) {
      playerName = playerName.substring(0, 18) + "..."; //eslint-disable-line
    }

    return playerName;
  }
}
