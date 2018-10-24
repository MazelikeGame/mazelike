/** @module backend/game/Floor */
import FloorCommon from "../../Frontend/game/common/floor.mjs";
import GameMap from "./game-map";
import Monster from "./monster.mjs";
import MonsterModel from "../models/monster";


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

    return floor;
  }

  /** katie
   * Puts a monster in half of all "rooms".
   * @param {Floor} floor The floor to add monsters to
   */
  generateMonsters() {
    this.monsters = [];
    for(let i = 0; i < this.map.rooms.length * this.monsterRatio; i++) { 
      this.monsters[i] = new Monster('sir spoopy', 100, 10, this, i, 1);
    }
  }

  /**
   * Load everything on the server
   * @param gameId The game id for the game we want to load
   * @param floorIdx The index of floor we want to load
   */
  static async load(gameId, floorIdx) {
    let floor = new Floor(gameId, floorIdx);

    await Promise.all([
      GameMap.load(floor),
      //floor.loadMonsters(floor) // untested todo
    ]);

    return floor;
  }

  /**
   * Save the floor (server side)
   */
  save() {
    return Promise.all([
      this.map.save(this.id),
      this.monsters[0].save()
    ]);
  }
  
  async loadMonsters(floor) { //todo db deleting~ UNTESTED
    //console.log("\nloading started");
    for(let i = 0; i < floor.map.rooms.length * this.monsterRatio; i++) {
      //console.log(i);
      let monsterDB = await MonsterModel.find({
        where: {
          floorId: floor.floor.floodId,
          id: i
        }
      }); //if nothing returned, dont create monster todo
      floor.monsters[i] = new Monster('sir spoopy', monsterDB.hp, 10, this, i, monsterDB.type);
      floor.monsters[i].setCoodinates(monsterDB.x, monsterDB.y);
    }
    //console.log("monsters loaded\n");
  }

}