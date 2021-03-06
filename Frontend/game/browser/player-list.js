/*global PIXI*/

/**
 * A list of players that displays information about each player.
 */
export default class PlayerList {

  constructor() {
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
      this.drawPlayerInfo(index, player);
    });

    let boss = this.floor.monsters.find((monster) => {
      return monster.type === "boss";
    });

    this.drawPlayerInfo(this.listOfPlayers.length, boss);

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
    outline.beginFill(player.type ? 0x000088 : 0x000000);
    outline.fillAlpha = this.floor.followingUser === player.name ? 0.85 : 0.7;
    outline.lineStyle(2, player.type ? 0x0000bb : 0x000000, 1);
    outline.drawRect(0, 0, 400, 30);
    outline.position.set(10, 10 + (id * offset)); //eslint-disable-line
    outline.endFill();
    playerBox.addChild(outline);

    this._playerNameStyle = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 14
    });

    //Player name
    let playerName = new PIXI.Text(this.checkNameLength(player.name), this._playerNameStyle);
    playerName.position.set(25, 15 + (id * offset)); //eslint-disable-line
    playerBox.addChild(playerName);

    //Player stats
    this._playerStatsStyle = new PIXI.TextStyle({
      fill: '#ffff00',
      fontSize: 10
    });
    this._playerStatsStr = ``;
    let playerStats = new PIXI.Text(`Def: ${player.defence} SPD: ${player.speed}\nDMG: ${player.damage}, RNG: ${player.range}`, this._playerStatsStyle);
    playerStats.position.set(190, 15 + (id * offset));
    playerBox.addChild(playerStats);

    //Health bar red
    let healthRedBar = new PIXI.Graphics();
    healthRedBar.beginFill(0xFF0000);
    healthRedBar.drawRect(0, 0, 100, 10);
    healthRedBar.position.set(300, 15 + (id * offset)); //eslint-disable-line
    healthRedBar.endFill();

    playerBox.addChild(healthRedBar);

    //Health bar green
    let healthGreenBar = new PIXI.Graphics();
    healthGreenBar.beginFill(0x7CFC00);
    healthGreenBar.drawRect(0, 0, player.getHp(), 10);
    healthGreenBar.position.set(300, 15 + (id * offset));//eslint-disable-line
    healthGreenBar.endFill();

    playerBox.addChild(healthGreenBar);

    //Health Text
    this._hpTextStyle = new PIXI.TextStyle({
      fill: "#FFFFFF",
      fontSize: 12
    });

    let healthText = new PIXI.Text(`Health: ${player.getHp()}`, this._hpTextStyle);
    healthText.position.set(300, 25 + (id * offset)); //eslint-disable-line
    playerBox.addChild(healthText);

    this.graphics.addChild(playerBox);
    this.playerBoxes.set(player.name, playerBox); //Stores the playerBox for future access accessible by username.
    this.hpBoxes.set(player.name, {
      text: healthText,
      greenBar: healthGreenBar,
      redBar: healthRedBar,
      playerStats: playerStats
    });
  }

  /**
   * Get the stats for a player
   * @param {string} key
   */
  _getStats(key) {
    if(key === "boss") {
      let match = this.floor.monsters.find((monster) => {
        return monster.type === "boss";
      });

      if(!match) {
        return {
          name: "boss",
          hp: 0,
          hpMax: 200
        };
      }

      return {
        name: match.name,
        hp: match.getHp(),
        hpMax: match.hpMax
      };
    }

    let match = this.listOfPlayers.find((player) => {
      return key === player.name;
    });

    if(!match) {
      return {
        name: key,
        hp: 0,
        hpMax: 150
      };
    }

    return {
      name: match.name,
      hp: match.getHp(),
      hpMax: match.hpMax,
      speed: match.speed,
      damage: match.damage,
      range: match.range,
      defence: match.defence
    };
  }

  /**
   * Updates the player list for each player.
   */
  update() {
    let index = 0;
    this.playerBoxes.forEach((value, key) => { // eslint-disable-line complexity
      let {name, hp, hpMax, defence, speed, range, damage} = this._getStats(key);

      let offset = 40; //Space between each player information box.
      let hpBox = this.hpBoxes.get(name);

      if(hp <= 0 && name !== 'boss') { // dead player
        hpBox.text.text = `DEAD`;
        hpBox.playerStats.text = 'Spectating';
      } else if(hp <= 0 && name === 'boss') { // dead boss
        hpBox.text.text = `DEAD`;
        hpBox.playerStats.text = 'Dropped key';
      } else if(name !== 'boss') { // alive player
        hpBox.text.text = `Health: ${hp}`;
        hpBox.playerStats.text = `DEF: ${defence} SPD: ${speed}\nDMG: ${damage}, RNG: ${range}`;
      } else { // alive boss
        hpBox.text.text = `Health: ${hp}`;
        hpBox.playerStats.text = '';
      }

      //Health bar red
      hpBox.redBar.clear();
      hpBox.redBar.beginFill(0xFF0000);
      hpBox.redBar.drawRect(0, 0, 100, 10);
      hpBox.redBar.position.set(300, 15 + (index * offset)); //eslint-disable-line
      hpBox.redBar.endFill();

      //Health bar green
      hpBox.greenBar.clear();
      hpBox.greenBar.beginFill(0x7CFC00);
      hpBox.greenBar.drawRect(0, 0, hp >= 0 ? hp / hpMax * 100 : 0, 10);
      hpBox.greenBar.position.set(300, 15 + (index * offset));//eslint-disable-line
      hpBox.greenBar.endFill();

      index++;
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
