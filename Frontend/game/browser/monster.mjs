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
    this.sprite.width = MonsterCommon.SPRITE_SIZE * this.size;
    this.sprite.height = MonsterCommon.SPRITE_SIZE * this.size;
    this.floor.monsterSprites.addChild(this.sprite);
    this.regularTint = this.sprite.tint;
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
    if(this.tinted !== -1) {
      if(this.sprite.tint === this.regularTint) {
        this.tint();
      }
      if(new Date().getTime() - this.tinted > 100) {
        this.tinted = -1;
        this.untint();
      }
    }
  }

  /**
   * Handle state updates from the server
   */
  handleState(state) {
    let oldHP = this.hp;
    let oldName = this.name;

    Object.assign(this, state);

    // update the sprite
    if(oldName !== this.name) {
      this.sprite.texture = PIXI.loader.resources.demon.textures[this.name];
    }
    if(oldHP !== this.hp) {
      this.tinted = new Date().getTime();
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

  /**
   * Tints player's sprite red. TODO need to test once players can attack.
   */
  tint() {
    this.tinted = new Date().getTime();
    this.sprite.tint = 0xFF0000;
  }

  /**
   * Untints player's sprite.
   */
  untint() {
    this.sprite.tint = this.regularTint;
    this.tinted = -1;
  }
}