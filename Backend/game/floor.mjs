/*global ml*/
/* eslint-disable complexity */
/** @module backend/game/Floor */
import FloorCommon from "../../Frontend/game/common/floor.mjs";
import GameMap from "./game-map";
import Monster from "./monster.mjs";
import Player from './player';
import LadderCommon from "../../Frontend/game/common/ladder.mjs";
import Item from './item';
import sql from "../sequelize";
import MonsterModel from "../models/monster.mjs";
import ItemModel from '../models/item.mjs';
import Sequelize from "sequelize";
import Maps from "../models/maps";
import Lobby from "../models/lobby";
import PlayerModel from "../models/player";

let monsterModel = new MonsterModel(sql);
let nextId = 0;
const NEW_MONSTER_INTERVAL = 15000;

export default class Floor extends FloorCommon {
  constructor(...args) {
    super(...args);
    this._lastMonster = Date.now();
  }

  /**
   * Generate a new floor (runs on the server and the browser)
   * @param gameId The game id for the game we want to generate
   * @param floorIdx The index of floor we want to generate
   * @param {object} opts The options of the specific generators
   */
  static generate({gameId, floorIdx, map}) {
    let floor = new Floor(gameId, floorIdx);
    floor.map = GameMap.generate(map);
    floor.generateMonsters();

    floor.map.ladder.placeInRandomRoom(floor.map);
    floor.items = [];

    return floor;
  }

  /**
   * Puts a monster in half of all "rooms".
   * @param {Floor} floor The floor to add monsters to
   */
  generateMonsters() {
    this.monsters = [];
    for(let i = 0; i < this.map.rooms.length * this.monsterRatio; i++) {
      if(i === 0) {
        this.monsters[i] = new Monster('boss', 500, 20, this, i, 'boss');
      } else {
        this.generateMonster();
      }
    }
  }

  /**
   * Geneate a new monster and place it in the floor
   */
  generateMonster() {
    this._lastMonster = Date.now();
    let random = Math.floor(Math.random() * 100);
    if(random < 15) { // 15% chance for blue demon
      this.monsters.push(new Monster('blue demon', 100, 10, this, ++nextId, 'blue'));
    } else if(random < 50) { // 35% chance for red demon, where 15+35 = 50
      this.monsters.push(new Monster('red demon', 50, 5, this, ++nextId, 'red'));
    } else if(random < 100) { // 50% chance for green demon, where 15+35+50 = 100
      this.monsters.push(new Monster('green demon', 30, 5, this, ++nextId, 'green'));
    }
  }

  /**
   * Load everything on the server
   * @param gameId The game id for the game we want to load
   * @param floorIdx The index of floor we want to load
   */
  static async load(gameId, floorIdx) {
    let floor = new Floor(gameId, floorIdx);

    await GameMap.load(floor);

    await Promise.all([
      Monster.load(floor),
      Player.load(floor),
      Item.load(floor)
    ]);

    return floor;
  }

  /**
   * Save the floor (server side)
   * @param {boolean} create Create new rows (first save only)
   */
  save(create) {
    return Promise.all([
      this.map.save(this.id, create),
      Monster.saveAll(this, create),
      Player.saveAll(this),
      Item.saveAll(this)
    ]);
  }

  /**
   * Moves all monsters and checks for collisions (also anything else that happens every turn)
   * @param {number} deltaTime The time that has ellasped since the last tick
   */
  tick(deltaTime) {
    for(let monster of this.monsters) {
      monster.move(deltaTime); // monster-monster collision check happens here
      monster.figureOutWhereToGo();
    }
    for(let player of this.players) {
      player.move();
      if(typeof this.regenerate === 'undefined') {
        if(LadderCommon.collision(player, this.map.ladder) && LadderCommon.doesPlayerHaveKey(player)) {
          this.regenerate = true; //Allows this to only regenerate once.
          ml.logger.info(`Player ${player.name} used a key on the ladder to spawn a new floor.`, ml.tags.ladder);
        }
      }

      if(player._frames.length) {
        player._confirmedId = player._frames[player._frames.length - 1].id;
      }
      player._confirmedX = player.x;
      player._confirmedY = player.y;
      player.dropConfirmed();
      player.removeOldItems();
      player.updateStats();
    }
    if(Date.now() - this._lastMonster >= NEW_MONSTER_INTERVAL) {
      this.generateMonster();
    }
  }

  /**
   * Send the current state of the floor to the client
   * @param {} io The socket io boradcast instance for this game
   */
  sendState(io) {
    io.emit("state", {
      monsters: this.monsters,
      players: this.players,
      isGameRunning: this.isGameRunning,
      items: this.items,
      id: this.id
    });
  }

  /**
   * Delete a game
   */
  async deleteGame() {
    let id = this.id.split("-")[0];

    let lobbies = await Lobby.findAll({
      where: {
        lobbyId: id
      }
    });
    
    for(var lobby of lobbies) {
      await PlayerModel.destroy({
        where: {
          id: lobby.player
        }
      });
    }

    return Promise.all([
      Maps.destroy({
        where: {
          floorId: {
            [Sequelize.Op.like]: `${id}-%`
          }
        }
      }),
      ItemModel.destroy({
        where: {
          floorId: {
            [Sequelize.Op.like]: `${id}-%`
          }
        }
      }),
      monsterModel.destroy({
        where: {
          floorId: {
            [Sequelize.Op.like]: `${id}-%`
          }
        }
      }),
      Lobby.destroy({
        where: {
          lobbyId: id
        }
      })
    ]);
  }
}
