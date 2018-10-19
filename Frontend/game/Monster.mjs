/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity */
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
    this.targetx = -1; //location where monster wants to move
    this.targety = -1;
    this.PCx = -1; // (-1,-1) if not seen yet or previously seen location explored
    this.PCy = -1;
    this.setup = true;

    this.placeInRandomRoom();

    //this.canSeePC();

  }

  createSprite() {
    this.sprite = new PIXI.Sprite(PIXI.loader.resources.demon.textures["red demon"]);
    this.sprite.position.set(this.x, this.y);
    this.sprite.width = SPRITE_SIZE;
    this.sprite.height = SPRITE_SIZE;
  }

  /**
   * todoWIP, UNFINISHED
   * 
   * Updates targetAquired field, which is true if we're currently in pursuit.
   * If PC is in sight, PCx and PCy will be updated (last known location coordinates)
   * If multiple PCs in sight, targets closest.
   */
  canSeePC() {
    this.targetAquired = false;
    let distances = [];
    let boxClear = true;
    let x1 = -1, x2 = -1, y1 = -1, y2 = -1;
    for(let i = 0; i < this.map.numPCs; i++) {
      //if theres a clean box with opposite corners being a pc and monster
      if(this.map.PC1x < this.x) {
        x1 = this.map.PC1x;
        x2 = this.x;
      } else {
        x1 = this.x;
        x2 = this.map.PC1x;
      }
      if(this.map.PC1y < this.y) {
        y1 = this.map.PC1y;
        y2 = this.y;
      } else {
        y1 = this.y;
        y2 = this.map.PC1y;
      }
      distances[i] = (x2 - x1 + 1) + (y2 - y1 + 1);
      boxClear = true;
      for(let j = x1; j <= x2; j++) {
        for(let k = y1; k <= y2; k++) {
          if(!this.map.isOnMap(j * SPRITE_SIZE, k * SPRITE_SIZE)) {
            boxClear = false;
          }
        }
      }
    }
    //only works for one pc todo
    this.targetAquired = boxClear;
    console.log(this.targetAquired);
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
    let redo = false;
    // for(let i = 0; i < this.map.monsters.length; i++) { //todo fix 
    //   if(i !== this.id && this.map.monsters[i].x === this.x && this.map.monsters[i].y === this.y)
    //     redo = true;
    // } 
    if(redo || !this.spriteIsOnMap()) {
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
    this.sprite.position.set(this.x, this.y);
  }

  /**
   * todoWIP, UNFINISHED (needs to be able to move strategically based on PC last seen location
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
    let msg = " attacked player ";
    //(decrement pc health and check for pc death) within PC's beAttacked method
    // below: psuedo until PC is implemented
    this.map.PC[PCid].beAttacked(this.damage);
    console.log(this.name + msg + PCid);
  }

  /**
   * ~WIP, UNFINISHED (merge logic with PC class once implemented)
   * 
   * PC attacks Monster
   * @param {*} hp health points that the monster's health decrements by
   */
  beAttacked(hp) {
    let msg = " was attacked, hp -= ";
    this.hp -= hp;
    if(this.hp <= 0)
      this.die();
    console.log(this.name + msg + hp);
  }

  /**
   * ~WIP drop items down the road todo
   * 
   * Monster dies.
   */
  die() {
    // remove sprite
    // remove from monsters array
    // drop item in the future
  }

  /** 
   * Places monster in a random "room" with no other monsters.
   */
  placeInRandomRoom() {
    let numRooms = this.map.rooms.length;
    this.initialRoom = Math.floor(Math.random() * numRooms);
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
        if(this.map.monsters[i].x >= this.x && this.map.monsters[i].x <= this.x + SPRITE_SIZE) { // upper right and lower right
          if(this.map.monsters[i].y >= this.y && this.map.monsters[i].y <= this.y + SPRITE_SIZE) {
            return true;
          }
        }
      }
    }
    return false;
  }
} 