/* global ml */
/* jshint node: true */
import PlayerCommon from '../../Frontend/game/common/player';
import PlayerModel from '../models/player';
import LobbyModel from '../models/lobby';
import UserModel from '../models/user';

/** @module backend/game/player */

const HP_BOOST_RATE = 1500;
const HP_BOOST_PERC = 0.05; // out of 1

/**
 * The player class.
 */
export default class Player extends PlayerCommon {

  constructor(...args) {
    super(...args);

    do {
      let spawn = this.floor.map.getSpawnPoint();
      this.x = this._confirmedX = spawn.x;
      this.y = this._confirmedY = spawn.y;
    } while(!this.spriteIsOnMap());

    this._lastHpBoost = Date.now();
  }

  /**
   * Private. Returns an object where the username of the player is the
   * key and the value is the player object.
   * @param {Floor} floor
   */
  static async getPlayers(floor) {
    let lobbyId = floor.id.slice(0, floor.id.indexOf('-'));
    let lobbies = await LobbyModel.findAll({
      where: {
        lobbyId: lobbyId
      }
    });
    let players = [];
    for(var lobby of lobbies) {
      let player = await PlayerModel.findOne({
        where: {
          id: lobby.player
        }
      });
      players.push(player);
    }
    let users = {};
    for(var player of players) {
      let user = await UserModel.findOne({
        where: {
          id: player.username
        }
      });
      users[user.username] = player;
    }
    return users;
  }

  /**
   * Loads all players
   * @param {Floor} floor - The floor to load the player for
   */
  static async load(floor) { // eslint-disable-line complexity
    /* Load every player in this lobby that is inGame */
    let players = await Player.getPlayers(floor);
    floor.players = [];
    for(var username of Object.keys(players)) {
      if(players[username].inGame) {
        if(players[username].x && players[username].y && players[username].hp) {
          let playerToPush = new Player(username, players[username].hp, players[username].spriteName, floor);
          playerToPush.setCoordinates(players[username].x, players[username].y);
          floor.players.push(playerToPush);
        } else {
          floor.players.push(new Player(username, 100, players[username].spriteName, floor));
        }
      }
    }
  }

  /**
   * Updates player records for all players in this lobby
   * @param {Floor} floor - The floor to save
   */
  static async saveAll(floor) {
    if(floor.players) {
      let players = await Player.getPlayers(floor);
      for(var username of Object.keys(players)) {
        let newValues = floor.players.find((playerClass) => {
          return playerClass.name === username;
        });

        if(!newValues) {
          // player died do something about that here
          await players[username].update({
            hp: 0
          });
          continue;
        }

        await players[username].update({
          spriteName: newValues.spriteName,
          x: newValues.x,
          y: newValues.y,
          hp: newValues.hp
        });
      }
    }
  }

  /**
   * Serialize player model for client
   */
  toJSON() {
    return {
      username: this.name,
      hp: this.hp,
      spriteName: this.spriteName,
      alive: this.alive,
      _confirmedId: this._confirmedId,
      _lastFrame: this._lastFrame,
      _confirmedX: this._confirmedX,
      _confirmedY: this._confirmedY,
      attackAngle: this.attackAngle,
      range: this.range,
    };
  }

  /**
   * Player dies
   */
  die() {
    ml.logger.info(`Player ${this.name} died`, ml.tags.player);
    this.alive = false;
    /* Remove the player from the player array */
    let player = this.floor.players.indexOf(this);
    this.floor.players.splice(player, 1);
  }

  /**
   * Boost hp after you stop moving
   */
  move(...args) {
    super.move(...args);

    // Restore a player's in safe rooms
    let rect = this.floor.map.getRect(this.x, this.y);
    if(Date.now() - this._lastHpBoost >= HP_BOOST_RATE && rect.noMonsters) {
      this._lastHpBoost = Date.now();
      if(this.hp < this.hpMax / 2) {
        this.hp = Math.min(this.hp + (this.hpMax * HP_BOOST_PERC), this.hpMax / 2);
      }
    }

    // Don't boost their health the second they enter a room
    if(!rect.noMonsters) {
      this._lastHpBoost = Date.now();
    }
  }
  
  /**
   * Removes items that have been worn past their due date
   */
  removeOldItems() {
    for(let wornItem of Object.values(this.wearing)) {
      try {
        if(Date.now() - wornItem.timeWorn > wornItem.maxWearTime) {
          this.wearing[wornItem.category] = null;
          ml.logger.verbose(`Player ${this.name} removed ${wornItem.spriteName}`, ml.tags.player);
        }
      } catch(error) {
        // Passing in case an item doesn't have a maxWearTime
      }
    }
  }
}
