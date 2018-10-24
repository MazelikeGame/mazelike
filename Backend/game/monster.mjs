/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity,prefer-template, no-warning-comments */
/** @module Monster */

import MonsterCommon from "../../Frontend/game/common/monster.mjs";
import MonsterModel from "../models/monster";
import sql from "../sequelize";

export default class Monster extends MonsterCommon {
  
  /** katie
   * Puts a monster in half of all "rooms".
   * @param {Floor} floor The floor to add monsters to
   */
  generateMonsters(floor) {
    for(let i = 0; i < this.map.rooms.length / 2; i++) { 
      floor.monsters[i] = new Monster('sir spoopy', 100, 10, this, i, 1);
    }
  }

  async save() { //todo untested
    let monsterModel = new MonsterModel(sql);
    for(let i = 0; i < this.floor.monsters.length; i++) {
      await monsterModel.create({
        floodId: this.floor.floodId,
        x: this.x,
        y: this.y,
        hp: this.hp,
        type: this.type
      });
      console.log("monster saved");
    }
  }

  async load(floor) { //todo
    for(let i = 0; i < floor.map.rooms.length / 2; i++) {
      //get monster stuff from database where floorid = floor.id
      //monster[i] = new Monster(data from database);
    }
  }

  /**
   * Given a min and a max integer, returns a random number between the two (*inclusive)
   * @param min 
   * @param max 
   */
  getRandomNumber(min, max) {
    //todo
  }

  
}