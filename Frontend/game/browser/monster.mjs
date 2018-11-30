/* eslint-disable max-len,curly,complexity,prefer-template */
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
  
    this._textStyle2 = new PIXI.TextStyle({
      fill: "#ff0000",
      fontSize: 24,
      fontFamily: "Tahoma",
      fontWeight: "bold"
    });

    this.hpNotificationSprite = new PIXI.Text("", this._textStyle2);
    this.hpNotificationSpriteOffset = (this.sprite.width / 2) - (this.hpNotificationSprite.width / 2);
    this.hpNotificationSprite.position.set(this.sprite.position.x + this.hpNotificationSpriteOffset, this.sprite.position.y - 40);
    this.floor.monsterSprites.addChild(this.hpNotificationSprite);
  }

  /**
   * Updates the sprite's position for all monsters on the floor.
   * @param viewX 
   * @param viewY 
   */
  update(viewX, viewY) {
    let now = Date.now();
    let prevx = this.x;
    let prevy = this.y;
    this.move(this._lastMove - now);
    this._lastMove = now;
    this.sprite.position.set(this.x - viewX, this.y - viewY);
    this.hpNotificationSprite.position.set(this.x - viewX + this.hpNotificationSpriteOffset, this.y - viewY - 25);
    if(this.tinted !== -1) {
      if(this.sprite.tint === this.regularTint) {
        this.tint();
        this.hpDamageTaken = Math.abs(this.hpDamageTaken) * -1;
        this.hpNotificationSprite.setText(this.hpDamageTaken);
        this.hpNotificationSpriteOffset = (this.sprite.width / 2) - (this.hpNotificationSprite.width / 2);
      }
      if(new Date().getTime() - this.tinted > 200) {
        this.tinted = -1;
        this.untint();
        this.hpNotificationSprite.setText();
      }
    }
    // todo
    if(this.collisionEntities(this.floor.monsters, this.SPRITE_SIZE) >= -1 || this.collisionEntities(this.floor.players, this.floor.players[0].SPRITE_SIZE) >= -1
      || !this.spriteIsOnMap()) {
      this.x = prevx;
      this.y = prevy;
      this.sprite.position.set(this.x - viewX, this.y - viewY);
      console.log("collision");
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
      this.hpDamageTaken = oldHP - this.hp;
    }
  }

  /**
   * Remove a monster from a PIXI.Container
   * @param {PIXI.Container} container
   */
  remove() {
    this.floor.monsterSprites.removeChild(this.sprite);
    this.floor.monsterSprites.removeChild(this.hpNotificationSprite);
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
   * Tints player's sprite red.
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