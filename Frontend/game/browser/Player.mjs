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
    this.sprite = new PIXI.Sprite(PIXI.loader.resources.player.textures[this.sprite]);
    this.sprite.position.set(this.x, this.y);
    this.sprite.width = PlayerCommon.SPRITE_SIZE;
    this.sprite.height = PlayerCommon.SPRITE_SIZE;
    this.floor.playerSprites.addChild(this.spriteName);
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
}
