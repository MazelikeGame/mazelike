/* global ml */
/** @module PlayerCommon */
import Monster from "./monster.mjs";

const KEYS = {
  upArrow: 38,
  w: 87,
  rightArrow: 39,
  d: 68,
  downArrow: 40,
  s: 83,
  leftArrow: 37,
  a: 65,
  space: 32,
  i: 73,
  j: 74,
  k: 75,
  l: 76
};

// map w to up, d to right, etc
const MAPPINGS = {
  [KEYS.w]: KEYS.upArrow,
  [KEYS.d]: KEYS.rightArrow,
  [KEYS.s]: KEYS.downArrow,
  [KEYS.a]: KEYS.leftArrow
};

/**
 * The player class.
 */
export default class PlayerCommon {

  /**
   * @param {string} name - The name of the player. Should be the same as user.username
   * @param {int} hp - The player's hitpoints
   * @param {string} spriteName - The name of the sprite for this player.
   * @param {floor} floor - The floor this player is on.
   */
  constructor(name, hp, spriteName, floor) {
    this.name = name;
    this.hp = 1000; //todo hp
    // this.hp = 100;
    this.hpMax = 100;
    this.alive = true;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.spriteName = spriteName;
    this.floor = floor;
    this.damage = 10;
    this.speed = 15;
    this.input = new Set();
    this._nextId = 0;
    this._lastFrame = Date.now();
    this._lastAttack = Date.now();
    this._frames = [];
    this.size = 1; // used with monster collision checking, acts as a size multiplier
    this.speed = 400;
    this.attackAngle = Math.PI / 4;
    this.range = 100;
  }

  /**
   * Get the position of the player.
   * @return {object}
   */
  getPosition() {
    return { x: this.x, y: this.y };
  }

  /**
   * Get the name of the player
   * @return {String} Name of this player.
   */
  getName() {
    return this.name;
  }

  /**
   * Get the hp of this player
   * @return {int} This player's hp.
   */
  getHp() {
    return this.hp;
  }

  /**
   * Get the velocity of the player
   * @return {object} { vx: int, vy: int }
   */
  getVelocity() {
    return { vx: this.vx, vy: this.vy };
  }

  /**
   * Update the player's velocity from key input.
   * @param {string} type - Either down or up
   * @param {event} e - User's keyboard input,
   */
  handleKeyPress(type, e) { // eslint-disable-line complexity
    let code = MAPPINGS[e.keyCode] || e.keyCode;

    if(type === "down") {
      this.input.add(code);
    } else {
      this.input.delete(code);
    }

    // change in x and y
    this.vx = 0;
    this.vy = 0;

    if(this.input.has(KEYS.upArrow)) {
      this.vy -= 1;
    }
    if(this.input.has(KEYS.downArrow)) {
      this.vy += 1;
    }
    if(this.input.has(KEYS.rightArrow)) {
      this.vx += 1;
    }
    if(this.input.has(KEYS.leftArrow)) {
      this.vx -= 1;
    }

    // attack direction x and y
    this.vxAttack = 0;
    this.vyAttack = 0;

    if(this.input.has(KEYS.i)) {
      this.vyAttack -= 1;
    }
    if(this.input.has(KEYS.k)) {
      this.vyAttack += 1;
    }
    if(this.input.has(KEYS.l)) {
      this.vxAttack += 1;
    }
    if(this.input.has(KEYS.j)) {
      this.vxAttack -= 1;
    }

    if(this.vxAttack || this.vyAttack) {
      this._attacking = true;
      this._mouseAttack = false;
    }
  }

  /**
   * Handle mouse positions
   */
  handleMouse(clicking, x, y) {
    if(clicking) {
      this._attacking = true;
      this._mouseAttack = true;
    }

    this._targetX = x - (PlayerCommon.SPRITE_SIZE / 2);
    this._targetY = y - (PlayerCommon.SPRITE_SIZE / 2);
  }

  /**
   * Send an input frame to the server
   */
  /* eslint-disable complexity */
  sendFrame() {
    let now = Date.now();
    let frame = {
      id: ++this._nextId,
      start: this._lastFrameSent,
      end: now,
      vx: this.vx,
      vy: this.vy,
      attacking: this._attacking,
      targetX: this._mouseAttack ? this._targetX : this.x + this.vxAttack,
      targetY: this._mouseAttack ? this._targetY : this.y + this.vyAttack
    };

    if(this.animateAttack && this._isAttacking()) {
      this.animateAttack(Math.atan2(frame.targetY - this.y, frame.targetX - this.x));
    }

    this._lastFrameSent = now;
    if(this.vx || this.vy || this._isAttacking()) {
      this._frames.push(frame);
      this.floor.sock.emit("player-frame", frame);

      if(this._isAttacking()) {
        this._lastAttack = now;
      }
    }

    this._attacking = false;
  }
  /* eslint-enable complexity */

  _isAttacking() {
    // eslint-disable-next-line
    return this._attacking && ((this._targetX && this._targetY) || !this._mouseAttack) &&
      Date.now() - this._lastAttack > PlayerCommon.ATTACK_TIME;
  }

  /**
   * Update the player's position based off the player's velocity
   */
  move() {
    this.x = this._confirmedX;
    this.y = this._confirmedY;

    /* eslint-disable complexity */
    this._frames.forEach((frame) => {
      // Ensure vx and vy are -1, 0, or 1
      if(frame.vx !== 0) {
        frame.vx = frame.vx < 0 ? -1 : 1;
      }
      if(frame.vy !== 0) {
        frame.vy = frame.vy < 0 ? -1 : 1;
      }

      // move the player
      let duration = frame.end - frame.start;
      if(duration < 0) {
        duration = 0;
      }

      duration *= this.speed / 1000;
      let prev = this.getPosition();
      this.x += frame.vx * duration;
      this.y += frame.vy * duration;
      
      if(!this.spriteIsOnMap() || this.collisionEntities(this.floor.monsters, Monster.SPRITE_SIZE) !== -1) {
        this.x = prev.x;
        this.y = prev.y;
      }

      ml.logger.debug(`Player ${this.name} moving from (${this._confirmedX}, ${this._confirmedY}) to (${this.x}, ${this.y})`, ml.tags.player);

      if(typeof window === "undefined") {
        this.processAttack(frame);
      }
    });
    /* eslint-enable complexity */
  }

  /* eslint-disable complexity, no-mixed-operators */
  /**
   * Checks to see if there's a monster colliding with this monster.
   * Compares corners of each sprite to do so.
   * @returns {boolean}
   */
  collisionEntities(entities, spriteSize) {
    let x = -1;
    let y = -1;
    for(let entity of entities) {
      if(this.id !== entity.id) {
        for(let j = 0; j < 4; j++) { // four corners to check for each sprite
          if(j === 0) { // upper left corner
            x = entity.x;
            y = entity.y;
          } else if(j === 1) { // upper right corner
            x = entity.x + spriteSize * entity.size;
            y = entity.y;
          } else if(j === 2) { // lower right corner
            x = entity.x + spriteSize * entity.size;
            y = entity.y + spriteSize * entity.size;
          } else if(j === 3) { // lower left corner
            x = entity.x;
            y = entity.y + spriteSize * entity.size;
          }
          if(x >= this.x && x <= this.x + spriteSize * entity.size) { // within x bounds
            if(y >= this.y && y <= this.y + spriteSize * entity.size) { // and within y bounds
              let index = entities.indexOf(entity);
              ml.logger.debug(`Player ${this.id} at (${this.x}, ${this.y}) collided with entity ${index} at (${entity.x}, ${entity.y})`, ml.tags.monster);
              return index;
            }
          }
        }
      }
    }
    return -1; // indicate no collision
  }
  /* eslint-disable complexity, no-mixed-operators */

  /**
   * Process an attack frame
   */
  /* eslint-disable complexity */
  processAttack(frame) {
    if(!frame.attacking) {
      return;
    }

    if(frame.start - this._lastAttack < PlayerCommon.ATTACK_TIME || frame.start < this._lastAttack) {
      ml.logger.debug(`Reject attack request ${frame.start} ${this._lastAttack}`, ml.tags.player);
      return;
    }

    this._lastAttack = frame.start;

    let attackAngle = Math.atan2(frame.targetY - this.y, frame.targetX - this.x);
    ml.logger.debug(`Player ${this.name} attacking at angle ${attackAngle}`, ml.tags.player);

    for(let monster of this.floor.monsters) {
      if(this.attackType === "rectangle") {
        if(this._isHittingRect(attackAngle, monster)) {
          this.attack(monster);
        }
      } else {
        // eslint-disable-next-line
        let monsterDist = Math.sqrt((monster.x - this.x) ** 2 + (monster.y - this.y) ** 2);
        let monsterAngle = Math.atan2(monster.y - this.y, monster.x - this.x);

        // check if the monster is in range
        if(monsterDist <= this.range && Math.abs(attackAngle - monsterAngle) <= this.attackAngle / 2) {
          this.attack(monster);
        }
      }
    }
  }

  /**
   * Check if the attack line is hitting a monster
   */
  _isHittingRect(attackAngle, monster) {
    let targetStart = {
      x: this.x + (PlayerCommon.SPRITE_SIZE / 2),
      y: this.y + (PlayerCommon.SPRITE_SIZE / 2)
    };

    let targetEnd = {
      x: targetStart.x + (this.range * Math.cos(attackAngle)),
      y: targetStart.y + (this.range * Math.sin(attackAngle))
    };

    // corrners of the monster hit box
    let monsterPoints = [
      { x: monster.x, y: monster.y },
      { x: monster.x + Monster.SPRITE_SIZE, y: monster.y },
      { x: monster.x, y: monster.y + Monster.SPRITE_SIZE },
      { x: monster.x + Monster.SPRITE_SIZE, y: monster.y + Monster.SPRITE_SIZE }
    ];

    // check if the attack line intersects with the monster's hit box
    if(this.instersects(targetStart, targetEnd, monsterPoints[0], monsterPoints[1])) {
      return true;
    }

    if(this.instersects(targetStart, targetEnd, monsterPoints[0], monsterPoints[2])) {
      return true;
    }

    if(this.instersects(targetStart, targetEnd, monsterPoints[3], monsterPoints[1])) {
      return true;
    }

    if(this.instersects(targetStart, targetEnd, monsterPoints[3], monsterPoints[2])) {
      return true;
    }

    return false;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // The following code is from Geeks for Geeks                                //
  // https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/ //
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Check if iPoint is on the line formed by point1 and point2
   * @param point1 
   * @param point2 
   * @param iPoint 
   */
  _isOnLine(point1, point2, iPoint) { 
    return Math.min(point1.x, point2.x) <= iPoint.x && iPoint.x <= Math.max(point1.x, point2.x) && 
      Math.min(point1.y, point2.y) <= iPoint.y && iPoint.y <= Math.max(point1.y, point2.y);
  } 

  /**
   * Determine the orientation of three points
   * @param p 
   * @param q 
   * @param r 
   */
  _getOrientation(p, q, r) { 
    // Algorithm from https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // eslint-disable-next-line
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y); 

    if(val === 0) {
      return "colinear";
    }

    return val > 0 ? "clockwise" : "counterclockwise";
  }

  /**
   * Check if two points intersect
   * @param line1p1 
   * @param line1p2 
   * @param line2p1 
   * @param line2p2 
   */
  instersects(line1p1, line1p2, line2p1, line2p2) { 
    let o1 = this._getOrientation(line1p1, line1p2, line2p1); 
    let o2 = this._getOrientation(line1p1, line1p2, line2p2); 
    let o3 = this._getOrientation(line2p1, line2p2, line1p1); 
    let o4 = this._getOrientation(line2p1, line2p2, line1p2); 

    // General case (intersecting non-parallel)
    if(o1 !== o2 && o3 !== o4) {
      return true;
    }

    // Special Cases (colinear aka all parallel)
    // line1p1, line1p2q1 and line2p1 are colinear and line2p1 lies on segment line1p1 line1p2 
    if(o1 === "colinear" && this._isOnLine(line1p1, line1p2, line2p1)) {
      return true;
    }

    // line1p1, line1p2 and line2p2 are colinear and line2p2 lies on segment line1p1 line1p2 
    if(o2 === "colinear" && this._isOnLine(line1p1, line1p2, line2p2)) {
      return true;
    }

    // line2p1, line2p2 and line1p1 are colinear and line1p1 lies on segment line1p line2p2 
    if(o3 === "colinear" && this._isOnLine(line2p1, line2p2, line1p1)) {
      return true;
    }

    // linep2, line2p2 and line1p2 are colinear and line1p2 lies on segment linep2 line2p2 
    if(o4 === "colinear" && this._isOnLine(line2p1, line1p2, line1p2)) {
      return true;
    }

    return false; // Doesn't fall in any of the above cases 
  }

  /* eslint-enable complexity */
  ///////////////////////////////////////////////////////////////////////////////
  // End of code from Geeks for Geeks                                          //
  ///////////////////////////////////////////////////////////////////////////////

  /**
   * Drop all confirmed frames
   */
  dropConfirmed() {
    while(this._frames.length && this._frames[0].id <= this._confirmedId) {
      this._frames.shift();
    }
  }

  /**
   * Checks to see if whole sprite is on the map. (Same as monster class)
   * @returns {boolean}
   */
  spriteIsOnMap() {
    return this.floor.map.isOnMap(this.x, this.y) &&
      this.floor.map.isOnMap(this.x + PlayerCommon.SPRITE_SIZE, this.y) &&
      this.floor.map.isOnMap(this.x, this.y + PlayerCommon.SPRITE_SIZE) &&
      this.floor.map.isOnMap(this.x + PlayerCommon.SPRITE_SIZE, this.y + PlayerCommon.SPRITE_SIZE);
  }

  /**
   * Set coordinates for this player
   * @param {int} x - new x-coordinate,
   * @param {int} y - new y-coordinate
   */
  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  /** 
   * Monster attacks player
   * @param {*} hp health points that the player's health decrements by
   */
  beAttacked(hp) {
    this.hp -= hp;
    if(this.hp <= 0) {
      this.die();
    }
    ml.logger.verbose(`Player ${this.name} was attacked with ${hp} damage (hp: ${this.hp})`, ml.tags.player);
  }

  /** 
   * Player attacks monster
   * @param {*} monster The monster to attack
   */
  attack(monster) {
    monster.beAttacked(this.damage);
  }
}
PlayerCommon.SPRITE_SIZE = 48;

// the minimum time between attacks
PlayerCommon.ATTACK_TIME = 187;