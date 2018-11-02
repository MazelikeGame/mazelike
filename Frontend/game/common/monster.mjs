/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity,prefer-template, no-warning-comments */
/** @module Monster */

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
    this.speed = 10;
    if(this.type === "blue") { // slow monsters
      this.speed = 20;
    }

    this.placeInRandomRoom();

    this.figureOutWhereToGo();
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
    // this.targetAquired = false;
    // let indexArray = [];
    // for i = 0 to map.numPcs/map.PCarray.length
    // __if(canSee(PC[i].x, PC[i].y));, repeat for all (most) pixels of pc
    // ____push i onto indexArray;
    // find closest PC that can be seen: use this.findDistance(pcx, pcy) and find minimum to find closest pc of PCs of indexArray
    // assign targetx and targety to closest pc that can be seen
  }

  /** 
   * ~WIP, UNFINISHED (need to check for collisions for items/players)
   * 
   * Monster moves to an adjacent, unoccupied location.
   */
  wander() {
    let random = Math.floor(Math.random() * 4); 
    let prevX = this.x;
    let prevY = this.y;
    if(random === 0)
      this.x += MonsterCommon.SPRITE_SIZE;
    else if(random === 1)
      this.x -= MonsterCommon.SPRITE_SIZE;
    else if(random === 2)
      this.y += MonsterCommon.SPRITE_SIZE;
    else if(random === 3)
      this.y -= MonsterCommon.SPRITE_SIZE;
    if(!this.spriteIsOnMap()) { // if trying to wander off map, doesn't move at all (until it wanders again)
      this.x = prevX;
      this.y = prevY;
    }
    this.targetx = this.x;
    this.x = prevX;
    this.targety = this.y;
    this.y = prevY;
  }

  /**
   * Sets the position closer to the target position.
   */
  move() {
    if(this.alive) {
      if(this.targetx < this.x)
        this.x--;
      else this.x++;
      if(this.targety < this.y)
        this.y--;
      else this.y++;
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
    //this.canSeePC();
    if(this.alive) {
      if(!this.targetAquired) {
        this.wander();
      } else {
        //move strategically, to be implemented later when PC is on map WIP
        console.log("omw bro");
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
    for(let i = 0; i < this.floor.monsters.length; i++) {
      if(this.id !== this.floor.monsters[i].id && this.floor.monsters[i].initialRoom === this.initialRoom) {
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
    for(let i = 0; i < this.floor.monsters.length; i++) {
      if(this.id !== this.floor.monsters[i].id) {
        for(let j = 0; j < 4; j++) { // four corners to check for each sprite
          if(j === 0) { // upper left corner
            x = this.floor.monsters[i].x;
            y = this.floor.monsters[i].y;
          } else if(j === 1) { // upper right corner
            x = this.floor.monsters[i].x + MonsterCommon.SPRITE_SIZE;
            y = this.floor.monsters[i].y;
          } else if(j === 1) { // lower right corner
            x = this.floor.monsters[i].x + MonsterCommon.SPRITE_SIZE;
            y = this.floor.monsters[i].y + MonsterCommon.SPRITE_SIZE;
          } else if(j === 1) { // lower left corner
            x = this.floor.monsters[i].x;
            y = this.floor.monsters[i].y + MonsterCommon.SPRITE_SIZE;
          }
          if(x >= this.x && x <= this.x + MonsterCommon.SPRITE_SIZE) { // within x bounds
            if(y >= this.y && y <= this.y + MonsterCommon.SPRITE_SIZE) { // and within y bounds
              return i;
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