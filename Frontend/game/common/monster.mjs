import { timingSafeEqual } from "crypto";

/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity,prefer-template, no-warning-comments */
/** @module Monster */

// The maximum amount of ms we want a monster to walk for
const MAX_WALK_TIME = 1500;

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
    this.PCx = -1; // (-1,-1) if not seen yet or previously seen location explored
    this.PCy = -1;
    this.maneuver = false;
    this.alive = true;

    // SPEED: 10 = regular, 20 = slow
    this.speed = 100;
    if(this.type === "blue") { // slow monsters
      this.speed = 50;
    }
  }

  /** 
   * Returns true if monster can see given pixel coordinate.
   * @param x 
   * @param y 
   */
  canSee(x, y) {
    this.maneuver = false;
    let x1 = -1, x2 = -1, y1 = -1, y2 = -1;
    let cornerx = this.x, cornery = this.y; // upper left
    let clear = true;
    let totalCorners = 0;
    for(let i = 0; i < 4; i++) {
      if(i === 1) {
        cornerx += MonsterCommon.SPRITE_SIZE; // upper right
      } else if(i === 2) {
        cornery += MonsterCommon.SPRITE_SIZE; // lower right
      } else if(i === 3) {
        cornerx -= MonsterCommon.SPRITE_SIZE; // lower left
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
      clear = true;
      for(let j = x1; j <= x2; j++) {
        for(let k = y1; k <= y2; k++) {
          if(!this.floor.map.isOnMap(j, k)) {
            clear = false;
            break;
          }
          if(!clear)
            break;
        }
      }
      if(clear)
        totalCorners++;
    }
    if(totalCorners === 0)
      return false;
    if(totalCorners < 4)
      this.maneuver = true;
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

  /** ~WIP, UNFINISHED (need PC implementation)
   * Finds closest PC that can be seen and targets it.
   */
  canSeePC() {
    this.targetAquired = false;
    for(let player of this.floor.players) {
      if(this.canSee(player.x, player.y) && this.canSee(player.x + player.SPRITE_SIZE, player.y + player.SPRITE_SIZE) &&
         this.canSee(player.x + player.SPRITE_SIZE, player.y) && this.canSee(player.x, player.y + player.SPRITE_SIZE)) {
        this.targetAquired = true;
        this.targetx = player.x;
        this.targety = player.y;
        return true;
      }
    }
    return false;
    // this.targetAquired = false;
    // let visiblePCs = [];
    // let maneuverArray = [];
    // for(let player of this.floor.players) {
    //   if(this.canSee(player.x, player.y) && this.canSee(player.x, player.y) &&
    //      this.canSee(player.x, player.y) && this.canSee(player.x, player.y)) {
    //     visiblePCs.push(player);
    //     maneuverArray.push(false);
    //   } else if(this.canSee(player.x, player.y) || this.canSee(player.x, player.y) ||
    //      this.canSee(player.x, player.y) || this.canSee(player.x, player.y)) {
    //     visiblePCs.push(player);
    //     maneuverArray.push(true);
    //   }
    // }
    // if(visiblePCs.length !== 0) {
    //   let closestPlayer = visiblePCs[0];
    //   let minDist = this.findDistance(closestPlayer.x, closestPlayer.y);
    //   let maneuver = maneuverArray[0];
    //   let i = 0;
    //   for(let player of visiblePCs) {
    //     if(this.findDistance(player.x, player.y) < minDist) {
    //       minDist = this.findDistance(player.x, player.y);
    //       closestPlayer = player;
    //       maneuver = maneuverArray[i];
    //       i++;
    //     }
    //   }
    //   this.maneuver = maneuver;
    //   this.targetAquired = true;
    //   this.targetx = closestPlayer.x;
    //   this.targety = closestPlayer.y;
    // }
    // return false;
    // find closest PC that can be seen: use this.findDistance(pcx, pcy) and find minimum to find closest pc of PCs of indexArray
    // assign targetx and targety to closest pc that can be seen
  }

  /** 
   * ~WIP, UNFINISHED (need to check for collisions for items/players)
   * 
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
    if(this.alive) {
      // Get the distance in the x and y direction we have to move
      let xDist = Math.abs(this.targetx - this.x);
      let yDist = Math.abs(this.targety - this.y);
      // Figure out what percentage of our next turn should be in each direction
      let xPerc = xDist / (xDist + yDist);
      let yPerc = 1 - xPerc;
      // Use pythagorean theorem to distrubute 
      let root = Math.sqrt(this.speed * (deltaTime / 1000));
      let xMove = Math.floor((root * xPerc) ** 2);
      let yMove = Math.floor((root * yPerc) ** 2);

      if(!isNaN(xMove)) {
        this.x += Math.min(xMove, xDist) * (this.targetx < this.x ? -1 : 1);
      }

      if(!isNaN(yMove)) {
        this.y += Math.min(yMove, yDist) * (this.targety < this.y ? -1 : 1);
      }
    }
    let collision = this.collisionMonsters();
    if(collision !== -1) {
      this.die();
    }
  }

  /**
   * ~WIP, UNFINISHED (needs to be able to move strategically based on PC last seen location
   * 
   * Moves monster.
   * If PC has been seen, move strategically towards last seen location.
   * Else (if PC not seen yet or last seen PC location has been explored) the monster wanders.
   */
  figureOutWhereToGo() {
    //if(this.floor.players.length !== 0)
    // this.canSeePC();
    this.targetAquired = false;
    if(this.alive) {
      if(!this.targetAquired) {
        if(this.targetx === -1 || this.targety === -1) {
          this.targetx = this.x;
          this.targety = this.y;
        }
        if(Math.abs(this.x - this.targetx) < 2 && Math.abs(this.y - this.targety) < 2) {
          this.wander();
        }
      } else {
        //move strategically, to be implemented later when PC is on map WIP
      }
    }
  }

  /**
   * ~WIP, UNFINISHED (merge logic with PC class once implemented)
   * 
   * Monster attacks PC
   * @param {*} PCid id for player that monster is attacking
   */
  attack(PCid) {
    //(decrement pc health and check for pc death) within PC's beAttacked method
    // below: psuedo until PC is implemented
    this.floor.map.PC[PCid].beAttacked(this.damage);
  }

  /**
   * ~WIP, UNFINISHED (merge logic with PC class once implemented)
   * 
   * PC attacks Monster
   * @param {*} hp health points that the monster's health decrements by
   */
  beAttacked(hp) {
    this.hp -= hp;
    if(this.hp <= 0)
      this.die();
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
    return this.floor.map.isOnMap(this.x, this.y) && this.floor.map.isOnMap(this.x + MonsterCommon.SPRITE_SIZE, this.y) 
    && this.floor.map.isOnMap(this.x, this.y + MonsterCommon.SPRITE_SIZE) && this.floor.map.isOnMap(this.x + MonsterCommon.SPRITE_SIZE, this.y + MonsterCommon.SPRITE_SIZE);
  }

  /**
   * Checks to see if there's a monster colliding with this monster. todo untested
   * Compares corners of each sprite to do so.
   * @returns {boolean}
   */
  collisionMonsters() {
    let x = -1;
    let y = -1;
    for(let monster of this.floor.monsters) {
      if(this.id !== monster.id) {
        for(let j = 0; j < 4; j++) { // four corners to check for each sprite
          if(j === 0) { // upper left corner
            x = monster.x;
            y = monster.y;
          } else if(j === 1) { // upper right corner
            x = monster.x + MonsterCommon.SPRITE_SIZE;
            y = monster.y;
          } else if(j === 1) { // lower right corner
            x = monster.x + MonsterCommon.SPRITE_SIZE;
            y = monster.y + MonsterCommon.SPRITE_SIZE;
          } else if(j === 1) { // lower left corner
            x = monster.x;
            y = monster.y + MonsterCommon.SPRITE_SIZE;
          }
          if(x >= this.x && x <= this.x + MonsterCommon.SPRITE_SIZE) { // within x bounds
            if(y >= this.y && y <= this.y + MonsterCommon.SPRITE_SIZE) { // and within y bounds
              return monster.id;
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