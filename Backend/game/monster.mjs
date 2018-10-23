/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity,prefer-template, no-warning-comments */
/* global PIXI */
/** @module Monster */

import MonsterCommon from "../../Frontend/game/common/monster.mjs";

export default class Monster extends MonsterCommon {
  
  save(floor) { //todo
    for(let i = 0; i < floor.monsters.length; i++) {
      //save monster stuff to database
    }
  }

  load(floor) { //todo
    for(let i = 0; i < floor.map.rooms.length / 2; i++) {
      //get monster stuff from database where floorid = floor.id
      //monster[i] = new Monster(data from database);
    }
  }
}