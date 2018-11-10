/* jshint node: true */
import PlayerCommon from '../../Frontend/game/common/player';
import PlayerModel from '../models/player';
import LobbyModel from '../models/lobby';
import UserModel from '../models/user';

/** @module backend/game/player */

/**
 * The player class.
 */
export default class Player extends PlayerCommon {

  constructor(...args) {
    super(...args);
    let spawn = this.floor.map.getSpawnPoint();
    this.x = spawn.x;
    this.y = spawn.y;
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
      let player = await PlayerModel.find({
        where: {
          id: lobby.player
        }
      });
      players.push(player);
    }
    let users = {};
    for(var player of players) {
      let user = await UserModel.find({
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
  // eslint-disable-next-line complexity
  static async load(floor) {
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
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      spriteName: this.spriteName,
      alive: this.alive
    };
  }

  /**
   * Player dies
   */
  die() {
    this.alive = false;
    /* Remove the player from the player array */
    let player = this.floor.players.indexOf(this);
    this.floor.players.splice(player, 1);
  }
}
