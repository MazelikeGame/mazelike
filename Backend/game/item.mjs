/* global ml */
/** @module backend/game/Item */
import fs from 'fs';
import util from 'util';

import ItemCommon from '../../Frontend/game/common/item.mjs';
import ItemModel from '../models/item.mjs';

const readFile = util.promisify(fs.readFile);
var numItems = 0;

export default class Item extends ItemCommon {
  static async load(floor) {
    let rawItems = await ItemModel.findAll({
      where: {
        floorId: floor.id
      }
    });
    floor.items = [];
    let itemDef = await Item.getItemDefinitions(true);
    for(let raw of rawItems) {
      let definition = itemDef.get(raw.spriteName);
      let item = new Item(
        floor,
        definition.spriteName,
        definition.spriteSize,
        definition.movementSpeed,
        definition.attackSpeed,
        definition.attack,
        definition.defence,
        definition.range,
        raw.id,
        definition.category,
        definition.accuracy,
        definition.attackStyle
      );
      if(raw.x || raw.y) {
        item.setCoordinates(raw.x, raw.y);
      }
      floor.items.push(item);
    }
  }

  /**
   * Saves items to the database.
   * @param {Floor} floor - The floor the items are on
   */
  static async saveAll(floor) {
    for(let item of floor.items) {
      let uniqueId = item.id;
      if(typeof(item.id) === typeof('string')) {
        uniqueId = item.id.slice(item.id.lastIndexOf('-') + 1);
      }
      let dataToSave = {
        id: `${item.floor.id}-${uniqueId}`,
        floorId: item.floor.id,
        x: item.x,
        y: item.y,
        spriteName: item.spriteName
      }
      let itemFound = await ItemModel.findOne({
        where: {
          id: dataToSave.id
        }
      });
      if(itemFound) {
        itemFound.update(dataToSave);
      } else {
        ItemModel.create(dataToSave);
      }
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
      isOnFloor: this.isOnFloor,
      category: this.category,
      accuracy: this.accuracy,
      attackStyle: this.attackStyle
    };
  }

  static async spawnRandomItem(floor, x, y) {
    let itemDefs = await Item.getItemDefinitions();
    let randomItem = itemDefs[Math.floor(Math.random() * itemDefs.length)];
    let newItem = new Item(
      floor,
      randomItem.spriteName,
      randomItem.spriteSize,
      randomItem.movementSpeed,
      randomItem.attackSpeed,
      randomItem.attack,
      randomItem.defence,
      randomItem.range,
      floor.map.numItems,
      randomItem.category,
      randomItem.accuracy,
      randomItem.attackStyle
    );
    ++floor.map.numItems;
    newItem.setCoordinates(x, y);
    newItem.isOnFloor = true;
    floor.items.push(newItem);
    ml.logger.verbose(`Spawning item ${newItem.spriteName} at (${newItem.x}, ${newItem.y})`, ml.tags.item);
  }

  static async getItemDefinitions(map = false) {
    let rawDefs = await readFile('Backend/game/item-definitions/item-definitions.json', 'utf-8');
    let jsonDefs = JSON.parse(rawDefs).itemDefinitions;
    if(map) {
      let defMap = new Map();
      for(let item of jsonDefs) {
        defMap.set(item.spriteName, item);
      }
      return defMap;
    }
    return jsonDefs;
  }
}
