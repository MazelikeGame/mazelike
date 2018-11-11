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
   * Load a Player
   * @param {Floor} floor - The floor to load the player for
   */
  static async load(floor) {
    let lobbyId = floor.id.slice(0, floor.id.indexOf('-'));
    let lobbies = await LobbyModel.findAll({
      where: {
        lobbyId: lobbyId,
      }
    });
    /* Load every player in this lobby that is inGame */
    floor.players = [];
    lobbies.forEach(async(lobby) => {
      let rawPlayer = await PlayerModel.find({
        where: {
          id: lobby.player,
        }
      });
      let user = await UserModel.find({
        where: {
          id: rawPlayer.username
        }
      });
      if(rawPlayer.inGame) {
        let player = new Player(user.username, 100, rawPlayer.spriteName, floor);
        floor.players.push(player);
      }
    });
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