/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity,prefer-template, no-warning-comments */
/* global PIXI */
/** @module Monster */

import MonsterCommon from "../common/monster.mjs";

export default class Monster extends MonsterCommon {

  /**
   * Generates sprite for a specific monster.
   */
  createSprite() {
    this.sprite = new PIXI.Sprite(PIXI.loader.resources.demon.textures["red demon"]);
    this.sprite.position.set(this.x, this.y);
    this.sprite.width = MonsterCommon.SPRITE_SIZE;
    this.sprite.height = MonsterCommon.SPRITE_SIZE;
  }

  /**
   * Goes through all monsters on the floor and creates their sprites.
   */
  createAllSprites() {
    for(let i = 0; i < this.floor.monsters.length; i++) {
      this.floor.monsters[i].createSprite();
    }
  }

  /**
   * Updates the sprite's position for all monsters on the floor.
   * @param viewX 
   * @param viewY 
   */
  update(viewX, viewY) {
    for(let i = 0; i < this.floor.monsters.length; i++) {
      this.floor.sprite.addChild(this.floor.monsters[i].sprite);
    }
    for(let i = 0; i < this.floor.monsters.length; i++) {
      this.floor.monsters[i].sprite.position.set(this.x + viewX, this.y + viewY);
    }
  }
}