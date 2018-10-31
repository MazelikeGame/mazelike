import PlayerCommon from "../common/player.mjs";

/* global PIXI */
/** @module Player */
const SPRITE_SIZE = 48;

/**
 * Have Player inherit from class Character. Same goes for Monster class.
 */
export default class Player extends PlayerCommon {

  /**
   * Create a sprite for player
   */
  createSprite() {
    this.sprite = new PIXI.Sprite(PIXI.loader.resources.player.textures.player1);
    this.sprite.position.set(this.xPos, this.yPos);
    this.sprite.width = SPRITE_SIZE;
    this.sprite.height = SPRITE_SIZE;
  }

  /**
   * Load a Player
   */
  // static async load(floor) {

  // }
}
