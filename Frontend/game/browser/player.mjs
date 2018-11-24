/* global PIXI */
import PlayerCommon from "../common/player.mjs";
import interpolate from "../common/interpolator.mjs";

/** @module Player */

/**
 * Have Player inherit from class Character. Same goes for Monster class.
 */
export default class Player extends PlayerCommon {
  constructor(...args) {
    super(...args);
    this._lastMove = Date.now();
    this.tinted = -1;
    this._lastFrame = undefined;
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
    this.regularTint = this.sprite.tint;

    this._textStyle = new PIXI.TextStyle({
      fill: "#fff",
      fontSize: 17
    });
    this.usernameSprite = new PIXI.Text(this.username, this._textStyle);
    this.usernameSpriteOffset = (this.sprite.width / 2) - (this.usernameSprite.width / 2);
    this.usernameSprite.position.set(this.sprite.position.x + this.usernameSpriteOffset, this.sprite.position.y - 10);
    this.floor.playerSprites.addChild(this.usernameSprite);
  }

  /**
   * Update the player sprite's position for all players on the floor.
   * @param {int} viewX,
   * @param {int} viewY
   */
  update(viewX, viewY) {
    // Interpolate players who are not the current player
    if(this.floor.username !== this.name) {
      let now = Date.now();
      interpolate(this, now - this._lastMove, this._confirmedX, this._confirmedY);
      this._lastMove = now;
    }

    this.sprite.position.set(this.x - viewX - this.usernameSpriteOffset, this.y - viewY + 10);
    this.usernameSprite.position.set(this.x - viewX, this.y - viewY);
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
   * Remove a player from a PIXI.container
   */
  remove() {
    this.floor.playerSprites.removeChild(this.sprite);
    this.floor.playerSprites.removeChild(this.usernameSprite);
  }

  /**
   * Player dies.
   */
  die() {
    this.floor.playerSprites.removeChild(this.sprite);
    this.floor.playerSprites.removeChild(this.usernameSprite);
    if(this.tinted !== -1) {
      this.untint();
    }
    this.hp = 0;
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

  handleState(state) {
    let oldName = this.spriteName;
    let oldHP = this.hp;

    delete state._lastFrame;
    Object.assign(this, state);

    // update the sprite
    if(oldName !== this.spriteName) {
      this.sprite.texture = PIXI.loader.resources.demon.textures[this.spriteName];
    }
    if(oldHP !== this.hp) {
      this.tinted = new Date().getTime();
    }
  }
}
