/** @module backend/game/Item */
import fs from 'fs';
import util from 'util';

import ItemCommon from '../../Frontend/game/common/item.mjs';
import ItemModel from '../models/item.mjs';

const readFile = util.promisify(fs.readFile);

export default class Item extends ItemCommon {
  static async load(floor) {
    let rawItems = await ItemModel.findAll({
      where: {
        floorId: floor.id
      }
    });
    floor.items = [];
    rawItems.forEach((raw) => {
      let itemDef = raw.getItemDefinition;
      let item = new Item(
        itemDef.spriteName,
        itemDef.spriteSize,
        itemDef.movementSpeed,
        itemDef.attackSpeed,
        itemDef.attack,
        itemDef.defence,
        itemDef.range
      );
      if(raw.x || raw.y) {
        item.setCoordinates(raw.x, raw.y);
      }
      floor.items.push(item);
    });
  }

  /**
   * Saves items to the database.
   * @param {Floor} floor - The floor the items are on
   * @param {boolean} create - Create new item rows
   */
  static async saveAll(floor, create) {
    let items = [];

    let save = (data) => {
      if(create) {
        items.push(data);
      } else {
        return ItemModel.update(data, {
          where: {
            id: data.id
          }
        });
      }
      return undefined;
    };
    for(let item of floor.items) {
      await save({
        floorId: item.floor.id,
        x: item.x,
        y: item.y
      });
    }

    if(create) {
      await ItemModel.bulkCreate(items);
    }
  }

  toJSON() {
    return {
      id: this.id,
      spriteName: this.spriteName,
      spriteSize: this.spriteSize,
      movementSpeed: this.movementSpeed,
      attackSpeed: this.attackSpeed,
      attack: this.attack,
      defence: this.defence,
      range: this.range,
      x: this.x,
      y: this.y,
      isOnFloor: this.isOnFloor
    };
  }

  /* Temporary. See TODO in frontend/game/browser/item */
  static async spawnRandomItem(floor, x, y) {
    let rawDefs = await readFile('Backend/game/item-definitions/item-definitions.json', 'utf-8');
    let itemDefs = JSON.parse(rawDefs).itemDefinitions;
    let randomItem = itemDefs[Math.floor(Math.random() * itemDefs.length)];
    let newItem = new Item(
      floor,
      randomItem.spriteName,
      randomItem.spriteSize,
      randomItem.movementSpeed,
      randomItem.attackSpeed,
      randomItem.attack,
      randomItem.defence,
      randomItem.range
    );
    newItem.setCoordinates(x, y);
    floor.items.push(newItem);
  }
}
