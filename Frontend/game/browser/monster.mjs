/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity,prefer-template, no-warning-comments */
/* global PIXI */
/** @module Monster */

import MonsterCommon from "../common/monster.mjs";

export default class Monster extends MonsterCommon {
  constructor(...args) {
    super(...args);
    this._lastMove = Date.now();
  }

  /**
   * Generates sprite for a specific monster and adds it to the floor.
   */
  createSprite() {
    this.sprite = new PIXI.Sprite(PIXI.loader.resources.demon.textures[this.name]);
    this.sprite.position.set(this.x, this.y);
    this.sprite.width = MonsterCommon.SPRITE_SIZE;
    this.sprite.height = MonsterCommon.SPRITE_SIZE;
    this.floor.monsterSprites.addChild(this.sprite);
  }

  /**
   * Updates the sprite's position for all monsters on the floor.
   * @param viewX 
   * @param viewY 
   */
  update(viewX, viewY) {
    let now = Date.now();
    this.move(this._lastMove - now);
    this._lastMove = now;

    this.sprite.position.set(this.x - viewX, this.y - viewY);
  }

  /**
   * Handle state updates from the server
   */
  handleState(state) {
    let oldName = this.name;
    Object.assign(this, state);

    // update the sprite
    if(oldName !== this.name) {
      this.sprite.texture = PIXI.loader.resources.demon.textures[this.name];
    }
  }

  /**
   * Remove a monster from a PIXI.Container
   * @param {PIXI.Container} container
   */
  remove() {
    this.floor.monsterSprites.removeChild(this.sprite);
  }
  
  /**
   * ~WIP drop items down the road
   * 
   * Monster dies.
   */
  die() {
    this.floor.monsterSprites.removeChild(this.sprite);
    this.x = -1; // (-1, -1) coordinate tells us that the monster is dead
    this.y = -1;
    this.alive = false;
  }
}