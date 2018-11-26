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
    this.hpBoxes = new Map();
  }

  /**
   * Renders the player list.
   */
  render() {
    this.listOfPlayers.forEach((player, index) => {
      this.drawPlayerInfo(index, player); //change this to match player.getHp() in the future
    });

    return this.graphics;
  }

  /**
   * Draws the player's information to the player list.
   * @param {int} id the index of the player
   * @param {string} player the player being drawn
   */
  drawPlayerInfo(id, player) {  
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
    let playerName = new PIXI.Text(this.checkNameLength(player.name), this._playerNameStyle);
    playerName.position.set(35, 15 + (id * offset)); //eslint-disable-line
    playerBox.addChild(playerName);

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
    healthGreenBar.drawRect(0, 0, player.getHp(), 10);
    healthGreenBar.position.set(200, 15 + (id * offset));//eslint-disable-line
    healthGreenBar.endFill();

    playerBox.addChild(healthGreenBar);

    //Health Text
    this._hpTextStyle = new PIXI.TextStyle({
      fill: "#FFFFFF",
      fontSize: 12
    });

    let healthText = new PIXI.Text(`Health: ${player.getHp()}`, this._hpTextStyle);
    healthText.position.set(200, 25 + (id * offset)); //eslint-disable-line
    playerBox.addChild(healthText);

    this.graphics.addChild(playerBox);
    this.playerBoxes.set(player.name, playerBox); //Stores the playerBox for future access accessible by username.
    this.hpBoxes.set(player.name, {
      text: healthText,
      greenBar: healthGreenBar,
      redBar: healthRedBar
    });
  }

  /**
   * Updates the player list for each player.
   */
  update() {
    //Compare listOfPlayers to playerBox map.

    this.playerBoxes.forEach((value, key) => {
      console.log(key);
    });

    this.listOfPlayers.forEach((player, index) => {
      let offset = 40; //Space between each player information box.
      let hpBox = this.hpBoxes.get(player.name);
      
      if(player.getHp() <= 0) {
        hpBox.text.text = `DEAD`;
      } else {
        hpBox.text.text = `Health: ${player.getHp()}`;
      }

      //Health bar red
      hpBox.redBar.clear();
      hpBox.redBar.beginFill(0xFF0000);
      hpBox.redBar.drawRect(0, 0, 100, 10);
      hpBox.redBar.position.set(200, 15 + (index * offset)); //eslint-disable-line
      hpBox.redBar.endFill();

      //Health bar green
      hpBox.greenBar.clear();
      hpBox.greenBar.beginFill(0x7CFC00);
      hpBox.greenBar.drawRect(0, 0, player.getHp() >= 0 ? player.getHp() : 0, 10);
      hpBox.greenBar.position.set(200, 15 + (index * offset));//eslint-disable-line
      hpBox.greenBar.endFill();
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