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
  update(viewX, viewY) { // eslint-disable-line complexity
    if(this.isOnFloor && !this.holder) {
      this.sprite.position.set(this.x - viewX, this.y - viewY);
    } else if (this.holder) {
      let x = window.innerWidth - 50;
      let y = 30;
      switch(this.category) {
      case 'shield':
        y = 60;
        break;
      case 'hat':
        y = 90;
        break;
      case 'boot':
        y = 120;
        break;
      case 'key':
        y = 150;
        break;
      default:
        break;
      }
      this.sprite.position.set(x, y);
    } else {
      this.remove();
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
