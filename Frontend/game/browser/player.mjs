/* eslint-disable max-len, complexity, prefer-template */
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
    this._lastFrame = undefined;
    
    this.tinted = -1;
    this.hpDamageTaken = -1;
    this._attackSprite = new PIXI.Graphics();
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
    this._textStyle2 = new PIXI.TextStyle({
      fill: "#ff0000",
      fontSize: 24,
      fontFamily: "Tahoma",
      fontWeight: "bold"
    });
    this._textStyle3 = new PIXI.TextStyle({
      fill: "#00ff00",
      fontSize: 24,
      fontFamily: "Tahoma",
      fontWeight: "bold"
    });

    this.usernameSprite = new PIXI.Text(this.username, this._textStyle);
    this.usernameSpriteOffset = (this.sprite.width / 2) - (this.usernameSprite.width / 2);
    this.usernameSprite.position.set(this.sprite.position.x + this.usernameSpriteOffset, this.sprite.position.y - 15);
    this.floor.playerSprites.addChild(this.usernameSprite);

    this.hpNotificationSprite = new PIXI.Text("", this._textStyle2);
    this.hpNotificationSpriteOffset = (this.sprite.width / 2) - (this.hpNotificationSprite.width / 2);
    this.hpNotificationSprite.position.set(this.sprite.position.x + this.hpNotificationSpriteOffset, this.sprite.position.y - 40);
    this.floor.playerSprites.addChild(this.hpNotificationSprite);
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
    this.sprite.position.set(this.x - viewX, this.y - viewY);
    this.usernameSprite.position.set(this.x - viewX + this.usernameSpriteOffset, this.y - viewY - 15);
    this.hpNotificationSprite.position.set(this.x - viewX + this.hpNotificationSpriteOffset, this.y - viewY - 40);
    if(this.tinted !== -1) {
      if(this.sprite.tint === this.regularTint) {
        this.tint();
        this.hpNotificationSprite.style = this.hpDamageTaken > 0 ? this._textStyle3 : this._textStyle2;
        this.hpNotificationSprite.setText((this.hpDamageTaken > 0 ? "+" : "") + this.hpDamageTaken);
        this.hpNotificationSpriteOffset = (this.sprite.width / 2) - (this.hpNotificationSprite.width / 2);
        this.usernameSprite.position.set(this.x - viewX + this.usernameSpriteOffset, this.y - viewY - 15);
      }
      if(new Date().getTime() - this.tinted > 200) {
        this.tinted = -1;
        this.untint();
        this.hpNotificationSprite.setText();
      }
    }
    this._attackFrame(this.x - viewX, this.y - viewY);
  }

  /**
   * Remove a player from a PIXI.container
   */
  remove() {
    this.floor.playerSprites.removeChild(this.sprite);
    this.floor.playerSprites.removeChild(this.usernameSprite);
    this.floor.playerSprites.removeChild(this.hpNotificationSprite);
  }

  /**
   * Player dies.
   */
  die() {
    this.floor.playerSprites.removeChild(this.sprite);
    this.floor.playerSprites.removeChild(this.usernameSprite);
    this.floor.playerSprites.removeChild(this.hpNotificationSprite);
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
    this.sprite.tint = this.hpDamageTaken > 0 ? 0x00FF00 : 0xFF0000;
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
      this.hpDamageTaken = this.hp - oldHP;
    }
  }

  /**
   * Start the attack animation
   */
  animateAttack(attackingAt) {
    this._attackingAt = attackingAt;
    this._attackStart = Date.now();
  }

  /**
   * Render a single frame in the attack animation
   */
  _attackFrame(x, y) {
    if(this._attackingAt !== undefined) {
      this.floor.attackSprites.removeChild(this._attackSprite);

      let percComplete = (Date.now() - this._attackStart) / PlayerCommon.ATTACK_TIME;

      if(percComplete > 1) {
        this._attackingAt = undefined;
        return;
      }

      this._attackSprite = new PIXI.Graphics();
      this.floor.attackSprites.addChild(this._attackSprite);

      if(this.attackType === "rectangle") {
        this._attackFrameRect(x, y, percComplete);
      } else {
        this._attackFrameArc(x, y, percComplete);
      }
    }
  }

  /**
   * Render a single frame in the attack arc animation
   */
  _attackFrameArc(x, y, percComplete) {
    let start = this._attackingAt - (this.attackAngle / 2) + (this.attackAngle * percComplete) - (Math.PI / 32);
    let end = start + (Math.PI / 16);

    this._attackSprite.moveTo(0, 0);
    this._attackSprite.beginFill(this._attackColor || 0xcccccc);
    this._attackSprite.lineStyle(0, 0x0);
    this._attackSprite.arc(0, 0, this.range, start, end);
    this._attackSprite.lineTo(0, 0);
    this._attackSprite.alpha = 0.8;
    this._attackSprite.position.set(x + (PlayerCommon.SPRITE_SIZE / 2), y + (PlayerCommon.SPRITE_SIZE / 2));
  }

  /**
   * Render a single frame in the attack rect animation
   */
  _attackFrameRect(x, y, percComplete) {
    let offset = PlayerCommon.SPRITE_SIZE / 2;
    this._attackSprite.position.set(x + offset, y + offset);
    this._attackSprite.lineStyle(7, this._attackColor || 0xcccccc);
    this._attackSprite.alpha = 0.7;

    let length = this.range * percComplete;
    this._attackSprite.moveTo(0, 0);
    this._attackSprite.lineTo(
      length * Math.cos(this._attackingAt),
      length * Math.sin(this._attackingAt)
    );
  }
}
