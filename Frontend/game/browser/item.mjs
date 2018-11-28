/* global PIXI */
import ItemCommon from '../common/item.mjs';

/** @module Item */

export default class Item extends ItemCommon {
  /* Temporary. TODO: Add itemType attr to item or create classes that extend Item */
  createSprite() {
    switch(this.spriteName) {
    case 'Iron Dagger':
      this.sprite = new PIXI.Sprite(PIXI.loader.resources.shortWep.textures[this.spriteName]);
      break;
    case 'Wooden Shield':
      this.sprite = new PIXI.Sprite(PIXI.loader.resources.shield.textures[this.spriteName]);
      break;
    case 'Iron Full Helm':
      this.sprite = new PIXI.Sprite(PIXI.loader.resources.hat.textures[this.spriteName]);
      break;
    case 'Iron Boots':
      this.sprite = new PIXI.Sprite(PIXI.loader.resources.boot.textures[this.spriteName]);
      break;
    default:
      break;
    }
    if(this.isOnFloor) {
      this.sprite.position.set(this.x, this.y);
    }
    this.sprite.width = this.sprite.height = this.spriteSize;
    this.floor.itemSprites.addChild(this.sprite);
  }

  /**
   * Update the sprite's position for all items on the floor
   * @param viewX
   * @param viewY
   */
  update(viewX, viewY) {
    if(this.isOnFloor) {
      this.sprite.position.set(this.x - viewX, this.y - viewY);
    }
  }

  handleState(state) {
    Object.assign(this, state);
  }

  /**
   * Remove an item from the itemSprites
   */
  remove() {
    this.floor.itemSprites.removeChild(this.sprite);
  }

  _positionsEqual(pos) {
    return this.x === pos.x && this.y === pos.y;
  }
}
