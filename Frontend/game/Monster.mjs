/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity,prefer-template, no-warning-comments */
/* global PIXI */
/** @module Monster */

const SPRITE_SIZE = 48;

export default class Monster {
  
  constructor(name_in, hp_in, damage_in, map_in, id_in) {
    this.name = name_in;
    this.hp = hp_in;
    this.damage = damage_in;
    this.map = map_in;
    this.id = id_in;

    this.targetAquired = false; // "in pursuit" boolean
    this.x = 0; // (x,y) = upper left pixel coordinate
    this.y = 0;
    this.targetx = -1; // location where monster wants to move
    this.targety = -1;
    this.PCx = -1; // (-1,-1) if not seen yet or previously seen location explored
    this.PCy = -1;
    this.maneuver = false;

    this.placeInRandomRoom();

    this.figureOutWhereToGo();

    this.die();
  }

  /**
   * Generates sprite for monster.
   */
  createSprite() {
    this.sprite = new PIXI.Sprite(PIXI.loader.resources.demon.textures["red demon"]);
    this.sprite.position.set(this.x, this.y);
    this.sprite.width = SPRITE_SIZE;
    this.sprite.height = SPRITE_SIZE;
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
        cornerx += SPRITE_SIZE; // upper right
      } else if(i === 2) {
        cornery += SPRITE_SIZE; // lower right
      } else if(i === 3) {
        cornerx -= SPRITE_SIZE; // lower left
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
          if(!this.map.isOnMap(j, k)) {
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

  /** todo test properly
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
   * 
   * isOnMap not quite working
   */
  wander() {
    let random = Math.floor(Math.random() * 4); 
    let prevX = this.x;
    let prevY = this.y;
    if(random === 0)
      this.x += SPRITE_SIZE;
    else if(random === 1)
      this.x -= SPRITE_SIZE;
    else if(random === 2)
      this.y += SPRITE_SIZE;
    else if(random === 3)
      this.y -= SPRITE_SIZE;
    if(!this.spriteIsOnMap()) {
      this.x = prevX;
      this.y = prevY;
      this.wander();
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
    if(this.targetx < this.x)
      this.x--;
    else this.x++;
    if(this.targety < this.y)
      this.y--;
    else this.y++;
    if(this.spriteCollision())
      this.wander();
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
    if(!this.targetAquired) {
      this.wander();
    } else {
      //move strategically, to be implemented later when PC is on map WIP
      console.log("omw bro");
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
    this.map.PC[PCid].beAttacked(this.damage);
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

  /** todo test
   * ~WIP drop items down the road
   * 
   * Monster dies.
   */
  die() {
    //this.map.monsters.splice(this.id, 1);
    //console.log("DEATH: " + this.map.monsters.length);
    // drop item in the future
  }

  /** 
   * Places monster in a random "room" with no other monsters.
   */
  placeInRandomRoom() {
    let numRooms = this.map.rooms.length;
    this.initialRoom = Math.floor(Math.random() * numRooms);
    this.initialRoom = 0;
    for(let i = 0; i < this.map.monsters.length; i++) {
      if(this.id !== i && this.map.monsters[i].initialRoom === this.initialRoom) {
        this.placeInRandomRoom();
      }
    }
    let randomDiffX = Math.floor(Math.random() * this.map.rooms[this.initialRoom].width); 
    this.x = this.map.rooms[this.initialRoom].x + randomDiffX;
    let randomDiffY = Math.floor(Math.random() * this.map.rooms[this.initialRoom].height); 
    this.y = this.map.rooms[this.initialRoom].y + randomDiffY;
    if(!this.spriteIsOnMap())
      this.placeInRandomRoom();
  }

  /**
   * Check to see if whole sprite is on the map.
   * @returns {boolean}
   */
  spriteIsOnMap() {
    return this.map.isOnMap(this.x, this.y) && this.map.isOnMap(this.x + SPRITE_SIZE, this.y) 
    && this.map.isOnMap(this.x, this.y + SPRITE_SIZE) && this.map.isOnMap(this.x + SPRITE_SIZE, this.y + SPRITE_SIZE);
  }

  /**
   * Checks to see if there's a monster colliding with this monster. todo untested
   * Compares corners of each sprite to do so.
   * @returns {boolean}
   */
  spriteCollision() {
    for(let i = 0; i < this.map.monsters.length; i++) {
      if(this.id !== i) {
        if(this.map.monsters[i].x >= this.x && this.map.monsters[i].x <= this.x + SPRITE_SIZE) { // within x bounds
          if(this.map.monsters[i].y >= this.y && this.map.monsters[i].y <= this.y + SPRITE_SIZE) { // and within y bounds
            return true;
          }
        }
      }
    }
    return false;
  }

  // changes for an actual test case: todo
  // remove any monsters in room one
  // place monster in room one
  // manually placing pc
  // replace this.x with this.map.monsters[0].x
  // outputs: all true
  pursue_test() {
    // TEST 1: directly left/right/up/down
    let pcx = this.x;
    let pcy = this.y;
    let cantplacepc = false;
    
    pcx += 1.5 * SPRITE_SIZE; // right
    if(!this.map.isOnMap(pcx, pcy)) { 
      pcx -= 2 * SPRITE_SIZE; // left
      if(!this.map.isOnMap(pcx, pcy)) { 
        pcx = this.x;
        pcy += 1.5 * SPRITE_SIZE; // down
        if(!this.map.isOnMap(pcx, pcy)) { 
          pcy -= 2 * SPRITE_SIZE; // up
          if(!this.map.isOnMap(pcx, pcy)) { 
            cantplacepc = true;
          }
        }
      }
    }

    let test1 = false;
    if(!cantplacepc) {
      test1 = this.canSee(pcx, pcy);
      console.log("test1: " + test1);
    } else {
      console.log("Could not place pc for test1."); // should not occur
    }

    // TEST 2: diagonal 
    pcx = this.x;
    pcy = this.y;
    cantplacepc = false;
    
    pcx += 1.5 * SPRITE_SIZE; // lower right
    pcy += 1.5 * SPRITE_SIZE;
    if(!this.map.isOnMap(pcx, pcy)) { 
      pcx -= 2 * SPRITE_SIZE; // lower left
      if(!this.map.isOnMap(pcx, pcy)) { 
        pcy -= 2 * SPRITE_SIZE; // upper left
        if(!this.map.isOnMap(pcx, pcy)) { 
          pcx += 2 * SPRITE_SIZE; // upper right
          if(!this.map.isOnMap(pcx, pcy)) { 
            cantplacepc = true;
          }
        }
      }
    }

    let test2 = false;
    if(!cantplacepc) {
      test2 = this.canSee(pcx, pcy);
      console.log("test2: " + test2);
      if(!test2)
        console.log(pcx, pcy, "monster:", this.x, this.y);
    } else {
      console.log("Could not place pc for test2. Run test on new map, as room 0 was generated as a corridor.");
    }

    // TEST 3: pc off map
    pcx = 0;
    pcy = 0;

    let test3 = false;
    test3 = !this.canSee(pcx, pcy);
    console.log("test3: " + test3);

    // TEST 4: place in far away room
    pcx = 0;
    pcy = 0;

    let pcRoom = this.map.rooms.length - 1; // a room far away from the testing monster
    let randomDiffX = Math.floor(Math.random() * this.map.rooms[pcRoom].width); 
    pcx = this.map.rooms[pcRoom].x + randomDiffX;
    let randomDiffY = Math.floor(Math.random() * this.map.rooms[pcRoom].height); 
    pcy = this.map.rooms[pcRoom].y + randomDiffY;

    let test4 = false;
    test4 = !this.canSee(pcx, pcy);
    console.log("test4: " + test4);
  } 
}