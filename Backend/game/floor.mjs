/*global ml*/
/* eslint-disable complexity */
/** @module backend/game/Floor */
import FloorCommon from "../../Frontend/game/common/floor.mjs";
import GameMap from "./game-map";
import Monster from "./monster.mjs";
import Player from './player';
import LadderCommon from "../../Frontend/game/common/ladder.mjs";
import Item from './item';

export default class Floor extends FloorCommon {
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
    let random = 0;
    for(let i = 0; i < this.map.rooms.length * this.monsterRatio; i++) {
      if(i === 0) {
        this.monsters[i] = new Monster('boss', 200, 15, this, i, 'boss', 200);
      } else {
        random = Math.floor(Math.random() * 100);
        if(random < 15) { // 15% chance for blue demon
          this.monsters[i] = new Monster('blue demon', 150, 10, this, i, 'blue', 150);
        } else if(random < 50) { // 35% chance for red demon, where 15+35 = 50
          this.monsters[i] = new Monster('red demon', 100, 5, this, i, 'red', 100);
        } else if(random < 100) { // 50% chance for green demon, where 15+35+50 = 100
          this.monsters[i] = new Monster('green demon', 50, 5, this, i, 'green', 50);
        }
      }
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
}
