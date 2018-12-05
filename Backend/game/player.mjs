/* global ml */
/* jshint node: true */
import PlayerCommon, {BASE_STATS} from '../../Frontend/game/common/player';
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
    this._lastHpBoost = Date.now();
  }

  /**
   * Move the player to the spawn point
   */
  respawn() {
    do {
      let spawn = this.floor.map.getSpawnPoint();
      this.x = this._confirmedX = spawn.x;
      this.y = this._confirmedY = spawn.y;
    } while(!this.spriteIsOnMap());
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
        if(players[username].hp) {
          let playerToPush = new Player(username, players[username].hp, players[username].spriteName, floor);
          if(players[username].x && players[username].y) {
            playerToPush.setCoordinates(players[username].x, players[username].y);
            playerToPush._confirmedX = players[username].x;
            playerToPush._confirmedY = players[username].y;
          } else {
            playerToPush.respawn();
          }
          floor.players.push(playerToPush);
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
      wearing: this.wearing,
      hpMax: this.hpMax,
      damage: this.damage,
      speed: this.speed,
      defence: this.defence
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
    let rect = this.floor.map.getRect(this.x, this.y) || {};
    if(Date.now() - this._lastHpBoost >= HP_BOOST_RATE && rect.noMonsters) {
      this._lastHpBoost = Date.now();
      this.hp = Math.min(this.hp + (this.hpMax * HP_BOOST_PERC), this.hpMax);
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
          wornItem.holder = false;
          this.wearing[wornItem.category] = null;
          ml.logger.verbose(`Player ${this.name} removed ${wornItem.spriteName}`, ml.tags.player);
          this.updateStats();
          this._reportStats();
        }
      } catch(error) {
        // Passing in case an item doesn't have a maxWearTime
      }
    }
  }

  /**
   * Player picks up nearby items that are not currently being worn
   */
  _pickupNearbyItems() {
    for(let item of this.floor.items) {
      if(
        item.getPosition() &&
        this._withinRadius(this.getPosition(), item.getPosition(), 12) &&
        !this.wearing[item.category]
      ) {
        item.pickup(this.name);
        ml.logger.verbose(`Player ${this.name} picked up a(n) ${item.spriteName}`, ml.tags.player);
        this.wieldItem(item);
      }
    }
  }

  /**
   * Updates the player's stats based on what is being worn.
   */
  updateStats() {
    this._setStatsToBase();
    for(let item of Object.values(this.wearing)) {
      if(item) {
        this.speed += item.movementSpeed;
        this.damage += item.damage;
        this.defence += item.defence;
        this.range += item.range;
      }
    }
  }

  wieldItem(item) {
    if(item.category === "key") {
      this.hasKey = true;
    }
    this.wearing[item.category] = item;
    this.updateStats();
    this._reportStats();
  }

  _setStatsToBase() {
    this.speed = BASE_STATS.speed;
    this.damage = BASE_STATS.damage;
    this.defence = BASE_STATS.defence;
    this.range = BASE_STATS.range;
  }

  _reportStats() {
    ml.logger.verbose(`${this.name}'s stats are now SP: ${this.speed}, DMG: ${this.damage}, DEF: ${this.defence}, RNG: ${this.range}`, ml.tags.player);
  }

  /**
   * Returns true if obj is within the desired radius of the center circle.
   *
   * @param {object} center - Coords to use that acts as the center of the circle
   * @param {object} obj - Object to compare to center's coord
   * @param {int} radius - the desired radius of the circle to check
   */
  _withinRadius(center, obj, radius) {
    let centerCoords = { x: Math.round(center.x), y: Math.round(center.y) };
    let objCoords = { x: Math.round(obj.x), y: Math.round(obj.y) };
    let hyp = Math.pow(objCoords.x - centerCoords.x, 2) + Math.pow(objCoords.y - centerCoords.y, 2);
    return hyp <= Math.pow(radius, 2);
  }
}
