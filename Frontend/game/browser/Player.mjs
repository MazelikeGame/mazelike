import PlayerCommon from "./player.mjs";

/* global PIXI */
/** @module Player */
const SPRITE_SIZE = 48;

/**
 * TODO: Have Player inherit from class Character. Same goes for Monster class.
 */
export default class Player extends PlayerCommon {

  /**
   * @param {string} name - The name of the player. Should be the same as user.username
   * @param {int} hp - The player's hitpoints
   * @param {object} spawn - Contains the spawn coordinates { x: int, y: int }.
   */
  constructor(name, hp, spawn) {
    super(name, hp, spawn);
  }

  /**
   * Generate sprite for player
   */
  createSprite() {
    this.sprite = new PIXI.Sprite(PIXI.loader.resources.player.textures['player1']);
    this.sprite.position.set(this.xPos, this.yPos);
    this.sprite.width = SPRITE_SIZE;
    this.sprite.height = SPRITE_SIZE;
  }
}
