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
    this.tinted = -1;
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

    this.redtint = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.redtint.tint = 0xff0000;
    this.redtint.width = PlayerCommon.SPRITE_SIZE;
    this.redtint.height = PlayerCommon.SPRITE_SIZE;
  }

  /**
   * Update the player sprite's position for all players on the floor.
   * @param {int} viewX,
   * @param {int} viewY
   */
  update(viewX, viewY) {
    // let now = Date.now();
    this.sprite.position.set(this.x - viewX, this.y - viewY);
    if(this.tinted !== -1) {
      if(new Date().getTime() - this.tinted > 250) {
        this.tinted = -1;
        this.untint();
      }
    }
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
    if(this.tinted !== -1) {
      this.untint();
    }
    this.hp = 0;
    this.alive = false;
  }

  tint() {
    this.floor.playerSprites.addChild(this.redtint);
    this.redtint.position.set(this.x, this.y);
    console.log("tint");
  }

  untint() {
    this.floor.playerSprites.removeChild(this.redtint);
    console.log("untint");
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
