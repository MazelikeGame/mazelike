/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity,prefer-template, no-warning-comments */
/* global PIXI */
/** @module Monster */

import MonsterCommon from "../common/monster.mjs";

export default class Monster extends MonsterCommon {

  /**
   * Generates sprite for a specific monster and adds it to the floor.
   */
  createSprite() {
    this.sprite = new PIXI.Sprite(PIXI.loader.resources.demon.textures["red demon"]);
    this.sprite.position.set(this.x, this.y);
    this.sprite.width = MonsterCommon.SPRITE_SIZE;
    this.sprite.height = MonsterCommon.SPRITE_SIZE;
    this.floor.sprite.addChild(this.sprite);
  }

  /**
   * Updates the sprite's position for all monsters on the floor.
   * @param viewX 
   * @param viewY 
   */
  update(viewX, viewY) {
    this.sprite.position.set(this.x - viewX, this.y - viewY);
  }

  /**
   * Handle state updates from the server
   */
  handleState(state) {
    console.log(state);
    Object.assign(this, state);
  }
}