/** @module backend/game/Item */
import ItemCommon from '../../Frontend/game/common/item';
import ItemModel from '../models/item';

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
      x: this.x,
      y: this.y,
      isOnFloor: this.isOnFloor
    };
  }
}
