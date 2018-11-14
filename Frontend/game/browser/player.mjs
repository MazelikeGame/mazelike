/* global PIXI */
import PlayerCommon from "../common/player.mjs";

/** @module Player */

/**
 * Have Player inherit from class Character. Same goes for Monster class.
 */
export default class Player extends PlayerCommon {
  constructor(...args) {
    super(...args);
    this._lastMove = Date.now();
  }

  /**
   * Create a sprite for player and add to the floor.
   */
  createSprite() {
    this.sprite = new PIXI.Sprite(PIXI.loader.resources.player.textures[this.spriteName]);
    this.sprite.position.set(this.x, this.y);
    this.sprite.width = PlayerCommon.SPRITE_SIZE;
    this.sprite.height = PlayerCommon.SPRITE_SIZE;
    this.floor.playerSprites.addChild(this.sprite);
  }

  /**
   * Update the player sprite's position for all players on the floor.
   * @param {int} viewX,
   * @param {int} viewY
   */
  update(viewX, viewY) {
    this.sprite.position.set(this.x - viewX, this.y - viewY);
  }

  /**
   * Remove a player from a PIXI.container
   */
  remove() {
    this.floor.playerSprites.removeChild(this.sprite);
  }

  /**
   * Player dies.
   */
  die() {
    this.floor.playerSprites.removeChild(this.sprite);
    this.hp = 0;
    this.alive = false;
  }

  handleState(state) {
    let oldName = this.spriteName;
    Object.assign(this, state);

    // update the sprite
    if(oldName !== this.spriteName) {
      this.sprite.texture = PIXI.loader.resources.demon.textures[this.spriteName];
    }
  }
}
