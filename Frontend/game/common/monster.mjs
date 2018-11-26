/* global ml */
/* eslint-disable no-extra-parens,max-len,curly,complexity,prefer-template, no-warning-comments, no-mixed-operators */
/** @module Monster */

// The maximum amount of ms we want a monster to walk for
const MAX_WALK_TIME = 1500;

import PlayerCommon from "./player.mjs";
import interpolate from "./interpolator.mjs";

export default class MonsterCommon {
  
  constructor(name_in, hp_in, damage_in, floor_in, id_in, type_in) {
    this.name = name_in;
    this.hp = hp_in;
    this.damage = damage_in;
    this.floor = floor_in;
    this.id = id_in;
    this.type = type_in;

    this.targetAquired = false; // "in pursuit" boolean
    this.x = 0; // (x,y) = upper left pixel coordinate
    this.y = 0;
    this.targetx = -1; // location where monster wants to move
    this.targety = -1;
    this.alive = true;
    this.lastAttackTime = new Date().getTime();
    this.size = 1; // size multiplier

    // SPEED: 100 = regular, 50 = slow
    this.speed = 200;
    if(this.type === "blue") { // slow monsters
      this.speed = 100;
    } else if(this.type === "boss") { // very slow
      this.speed = 75;
      this.size = 2;
    }
  }

  /** 
   * Returns true if monster can see given pixel coordinate.
   * @param x 
   * @param y 
   */
  canSee(x, y) {
    let x1 = -1, x2 = -1, y1 = -1, y2 = -1;
    let cornerx = this.x, cornery = this.y; // upper left
    for(let i = 0; i < 4; i++) {
      if(i === 1) {
        cornerx += MonsterCommon.SPRITE_SIZE * this.size; // upper right
      } else if(i === 2) {
        cornery += MonsterCommon.SPRITE_SIZE * this.size; // lower right
      } else if(i === 3) {
        cornerx -= MonsterCommon.SPRITE_SIZE * this.size; // lower left
      }
      if(x < cornerx) {
        x1 = x;
        x2 = cornerx;
      } else {
        x1 = cornerx;
        x2 = x;
      }
      if(y < cornery) {
        y1 = y;
        y2 = cornery;
      } else {
        y1 = cornery;
        y2 = y;
      }
      for(let j = x1; j <= x2; j += 20) { // checking every 20th pixel to improve runtime
        for(let k = y1; k <= y2; k += 20) {
          if(!this.floor.map.isOnMap(j, k)) {
            return false;
          }  
        }
      }
    }
    return true;
  }

  /**
   * Finds distance between monster and coodinate.
   * @param x 
   * @param y 
   * @return {double}
   */
  findDistance(x, y) {
    let asquared = Math.pow(x - this.x, 2);
    let bsquared = Math.pow(y - this.y, 2);
    let c = Math.sqrt(asquared + bsquared);
    return c;
  }

  /**
   * Finds closest PC that can be seen and targets it.
   */
  canSeePC() {
    this.targetAquired = false;
    let minDist = -1;
    for(let player of this.floor.players) {
      if(this.canSee(player.x, player.y) && this.canSee(player.x + player.SPRITE_SIZE * this.size, player.y + player.SPRITE_SIZE * this.size) &&
         this.canSee(player.x + player.SPRITE_SIZE * this.size, player.y) && this.canSee(player.x, player.y + player.SPRITE_SIZE * this.size)) {
        this.targetAquired = true;
        if(this.findDistance(player.x, player.y) < minDist || minDist === -1) {
          this.targetx = player.x;
          this.targety = player.y;
          minDist = this.findDistance(player.x, player.y);
        }
      }
    }
    return minDist !== -1;
  }

  /**  
   * Monster moves to an adjacent, unoccupied location.
   */
  wander() {
    let prev = {x: this.x, y: this.y};
    let dist;
    // the distance we want to travel
    let targetDist = this.speed * (MAX_WALK_TIME / 1000);
    let count = 1000;

    // the angle of the direction we want to travel in
    // eslint-disable-next-line
    let theta = Math.floor(Math.random() * 360) * (Math.PI / 180) - Math.PI;
    Object.assign(this, prev);

    // start moving in that direction until we reach our target or a wall
    do {
      this.x += Math.cos(theta);
      this.y += Math.sin(theta);
      // eslint-disable-next-line
      dist = Math.sqrt(Math.abs(prev.x - this.x) ** 2 + Math.abs(prev.y - this.y) ** 2);
    } while(this.spriteIsOnMap() && dist < targetDist && --count > 0);
    
    // Back up until we are back on the map
    do {
      this.x -= Math.cos(theta);
      this.y -= Math.sin(theta);
      // eslint-disable-next-line
      dist = Math.sqrt(Math.abs(prev.x - this.x) ** 2 + Math.abs(prev.y - this.y) ** 2);
    } while(!this.spriteIsOnMap() && dist > 0 && --count > 0);

    this.targetx = Math.floor(this.x);
    this.targety = Math.floor(this.y);
    Object.assign(this, prev);

    // Don't go anywhere if we ran for too long
    if(count === 0) {
      this.targetx = this.x;
      this.targety = this.y;
    }
  }

  /**
   * Sets the position closer to the target position.
   * @param {number} deltaTime The number of ms since the last move
   */
  move(deltaTime) {
    let prevy = this.y;
    let prevx = this.x;
    if(this.alive) {
      interpolate(this, deltaTime, this.targetx, this.targety);
    }
    // Disable collision detection on the client
    if(typeof window === "undefined") {
      let collisionMonster = this.collisionEntities(this.floor.monsters, MonsterCommon.SPRITE_SIZE);
      let collisionPlayer = this.collisionEntities(this.floor.players, PlayerCommon.SPRITE_SIZE);
      if(collisionMonster !== -1 || collisionPlayer !== -1) {
        this.targetx = prevx;
        this.targety = prevy;
        this.x = prevx;
        this.y = prevy;
        this.collision = true;
        let currentTime = new Date().getTime();
        if(collisionPlayer !== -1 && currentTime - this.lastAttackTime >= 750) { // attacks max evey 0.75 seconds
          this.lastAttackTime = currentTime;
          this.attack(collisionPlayer);
        }
      } else {
        this.collision = false;
      }
    }
  }

  /** 
   * Moves monster.
   * If PC has been seen, move strategically towards last seen location.
   * Else (if PC not seen yet or last seen PC location has been explored) the monster wanders.
   */
  figureOutWhereToGo() {
    this.canSeePC();
    if(this.targetAquired) {
      ml.logger.debug(`Monster ${this.id} targeting player at (${this.targetx}, ${this.targety})`, ml.tags.monster);
    }
    if(this.alive) {
      if(!this.targetAquired && !this.collision) {
        if(this.targetx === -1 || this.targety === -1) {
          this.targetx = this.x;
          this.targety = this.y;
        }
        if(Math.abs(this.x - this.targetx) < 2 && Math.abs(this.y - this.targety) < 2) {
          this.wander();
        }
        ml.logger.debug(`Monster ${this.id} wandering to (${this.targetx}, ${this.targety})`, ml.tags.monster);
      }
    }
  }

  /** 
   * Player attacks Monster
   * @param {*} hp health points that the monster's health decrements by
   */
  beAttacked(hp) {
    this.hp -= hp;
    if(this.hp <= 0) {
      this.die();
    }
    ml.logger.verbose(`Monster ${this.id} was attached with ${hp} damage (hp: ${this.hp})`, ml.tags.monster);
  }

  /** 
   * Monster attacks PC
   * @param {*} playerID id for player that monster is attacking
   */
  attack(playerID) {
    this.floor.players[playerID].beAttacked(this.damage);
  }

  /** 
   * Places monster in a random "room" with no other monsters.
   */
  placeInRandomRoom() {
    let numRooms = this.floor.map.rooms.length;
    this.initialRoom = Math.floor(Math.random() * numRooms);
    for(let monster of this.floor.monsters) {
      if(this.id !== monster.id && monster.initialRoom === this.initialRoom) {
        this.placeInRandomRoom();
      }
    }
    let randomDiffX = Math.floor(Math.random() * this.floor.map.rooms[this.initialRoom].width); 
    this.x = this.floor.map.rooms[this.initialRoom].x + randomDiffX;
    let randomDiffY = Math.floor(Math.random() * this.floor.map.rooms[this.initialRoom].height); 
    this.y = this.floor.map.rooms[this.initialRoom].y + randomDiffY;
    if(!this.spriteIsOnMap())
      this.placeInRandomRoom();
  }

  /**
   * Check to see if whole sprite is on the map.
   * @returns {boolean}
   */
  spriteIsOnMap() {
    return this.floor.map.isOnMap(this.x, this.y) && this.floor.map.isOnMap(this.x + MonsterCommon.SPRITE_SIZE * this.size, this.y) 
    && this.floor.map.isOnMap(this.x, this.y + MonsterCommon.SPRITE_SIZE * this.size) && this.floor.map.isOnMap(this.x + MonsterCommon.SPRITE_SIZE * this.size, this.y + MonsterCommon.SPRITE_SIZE * this.size);
  }

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
          } else if(j === 1) { // lower right corner
            x = entity.x + spriteSize * entity.size;
            y = entity.y + spriteSize * entity.size;
          } else if(j === 1) { // lower left corner
            x = entity.x;
            y = entity.y + spriteSize * entity.size;
          }
          if(x >= this.x && x <= this.x + spriteSize * entity.size) { // within x bounds
            if(y >= this.y && y <= this.y + spriteSize * entity.size) { // and within y bounds
              let index = entities.indexOf(entity);
              ml.logger.debug(`Monster ${this.id} at (${this.x}, ${this.y}) collided with entity ${index} at (${entity.x}, ${entity.y})`, ml.tags.monster);
              return index;
            }
          }
        }
      }
    }
    return -1; // indicate no collision
  }

  /**
   * Manually set coordinates for a single
   */
  setCoodinates(x, y) {
    this.x = x;
    this.y = y;
  }
}

MonsterCommon.SPRITE_SIZE = 48;