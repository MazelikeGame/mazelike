/* global PIXI */
import ItemCommon from '../common/item.mjs';

/** @module Item */

export default class Item extends ItemCommon {
  /**
   * Generate sprite for a specific item. Sets the position for the sprite if the
   * item is on the floor.
   */
  createSprite() {
    this.sprite = new PIXI.Sprite(PIXI.loader.resources[this.category].textures[this.spriteName]);
    if(this.isOnFloor) {
      this.sprite.position.set(this.x, this.y);
    }
    this.sprite.width = this.sprite.height = this.spriteSize;
    this.floor.itemSprites.addChild(this.sprite);

    // would be nice to consolidate to a function. currently not working
    // this._textStyle = new PIXI.TextStyle({
    //   fill: '#fff',
    //   fontSize: 17
    // });
    // this.itemNameSprite = new PIXI.Text(this.spriteName, this._textStyle);
    // /* eslint-disable-next-line no-extra-parens */
    // this.itemNameSpriteOffset = (this.sprite.width / 2) - (this.itemNameSprite.width / 2);
    // this.itemNameSprite.position.set(
    //   this.sprite.position.x + this.itemNameSpriteOffset,
    //   this.sprite.position.y - 15
    // );
    // this.floor.itemSprites.addChild(this.itemNameSprite);
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

  /**
   * Handle state updates from the server
   */
  handleState(state) {
    Object.assign(this, state);
  }

  /**
   * Remove an item sprite from the list of itemSprites
   */
  remove() {
    this.floor.itemSprites.removeChild(this.sprite);
  }
}
