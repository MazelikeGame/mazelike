/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity,prefer-template, no-warning-comments */
/** @module Monster */

import MonsterCommon from "../../Frontend/game/common/monster.mjs";
import MonsterModel from "../models/monster";
import sql from "../sequelize";

// a list of all dead monsters (improves the performance of save)
let deadMonsterIds = [];

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
      let monster = new Monster(raw.name, raw.hp, 10, floor, i, raw.type);
      monster.setCoodinates(raw.x, raw.y);
      floor.monsters.push(monster);
    });
  }

  /**
   * Saves monsters to the database.
   * @param {boolean} create Create new monster rows (first save only)
   */
  static async saveAll(floor, create) {
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

    for(let i = 0; i < floor.monsters.length; i++) {
      let monster = floor.monsters[i];
      await save({
        id: `${monster.floor.id}-${monster.id}`,
        floorId: monster.floor.id,
        x: monster.x,
        y: monster.y,
        hp: monster.hp,
        type: monster.type,
        name: monster.name
      });
    }

    // use bulk create
    if(create) {
      await monsterModel.bulkCreate(monsters);
    }

    // delete dead monsters
    await monsterModel.destroy({
      where: {
        id: deadMonsterIds
      }
    });
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
      y: this.y,
      name: this.name
    };
  }
  
  /**
   * ~WIP drop items down the road
   * 
   * Monster dies.
   */
  die() {
    this.x = -1; // (-1, -1) coordinate tells us that the monster is dead
    this.y = -1;
    this.alive = false;

    // remove from the monsters array
    let thisIdx = this.floor.monsters.indexOf(this);
    this.floor.monsters.splice(thisIdx, 1);

    // add to the list of monsters for save to delete
    deadMonsterIds.push(`${this.floor.id}-${this.id}`);
  }
}