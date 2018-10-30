/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity,prefer-template, no-warning-comments */
/** @module Monster */

import MonsterCommon from "../../Frontend/game/common/monster.mjs";
import MonsterModel from "../models/monster";
import sql from "../sequelize";

export default class Monster extends MonsterCommon {
  
  /**
   * Puts 
   *  monster in half of all "rooms".
   * @param {Floor} floor The floor to add monsters to
   */
  generateMonsters(floor) {
    for(let i = 0; i < this.map.rooms.length * this.monsterRatio; i++) { 
      floor.monsters[i] = new Monster('sir spoopy', 100, 10, this, i, 1);
    }
  }

  static async load(floor) {
    let monsterModel = new MonsterModel(sql);
    let rawMonsters = await monsterModel.findAll({
      where: {
        floorId: floor.id
      }
    });

    floor.monsters = [];
    
    rawMonsters.forEach((raw, i) => {
      let monster = new Monster("sir snoopy", raw.hp, 10, floor, i, raw.type);
      monster.setCoodinates(raw.x, raw.y);
      floor.monsters.push(monster);
    });
  }

  /**
   * Saves monsters to the database.
   * @param {boolean} create Create new monster rows (first save only)
   */
  async save(create) {
    let monsterModel = new MonsterModel(sql);
    let monsters = []; // collect monsters for bulkCreate

    // create or update the data
    let save = (data) => {
      if(create) {
        monsters.push(data);
      } else {
        return monsterModel.update(data, {
          where: {
            id: data.id
          }
        });
      }
      return undefined; // make eslint happy
    };

    for(let i = 0; i < this.floor.monsters.length; i++) {
      let monster = this.floor.monsters[i];
      await save({
        id: `${monster.floor.id}-${monster.id}`,
        floorId: monster.floor.id,
        x: monster.x,
        y: monster.y,
        hp: monster.hp,
        type: monster.type
      });
    }

    // use bulk create
    if(create) {
      await monsterModel.bulkCreate(monsters);
    }

    console.log("\nmonsters saved\n");
  }

  /**
   * Given a min and a max integer, returns a random number between the two (*inclusive)
   * @param min 
   * @param max 
   */
  getRandomNumber(min, max) {
    return Math.floor(Math.random() * max) + min; 
  }

  /**
   * Select only the propertys we need for sending monsters to the client
   */
  toJSON() {
    return {
      id: this.id,
      targetx: this.targetx,
      targety: this.targety,
      hp: this.hp,
      type: this.type,
      x: this.x,
      y: this.y
    };
  }
  
}