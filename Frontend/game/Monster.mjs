/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity */
/* global PIXI */
/** @module Monster */

const BLOCK_SIZE = 48;

export default class Monster {
  
  constructor(name_in, hp_in, damage_in, map_in, id_in) {
    this.name = name_in;
    this.hp = hp_in;
    this.damage = damage_in;
    this.map = map_in;
    this.id = id_in;
    this.targetAquired = false; // "in pursuit" boolean
    this.x = 20;
    this.y = 2;

    this.PCx = -1; // -1 if not seen yet or previously seen location explored
    this.PCy = -1;

    //this.placeInRandomRoom(); todo testing

    this.sprite = new PIXI.Sprite(PIXI.loader.resources.demon.textures["red demon"]);
    this.sprite.position.set(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE);
    this.sprite.width = BLOCK_SIZE;
    this.sprite.height = BLOCK_SIZE;

    this.canSeePC();

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
          if(!this.map.isOnMap(j * BLOCK_SIZE, k * BLOCK_SIZE)) {
            boxClear = false;
            console.log("NOPE");
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
      this.x += 1;
    else if(random === 1)
      this.x -= 1;
    else if(random === 2)
      this.y += 1;
    else if(random === 3)
      this.y -= 1;
    let redo = false;
    for(let i = 0; i < this.map.monsters.length; i++) {
      if(i !== this.id && this.map.monsters[i].x === this.x && this.map.monsters[i].y === this.y)
        redo = true;
    } 
    if(redo || !this.map.isOnMap(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE)) {
      this.x = prevX;
      this.y = prevY;
      this.wander();
    }
    this.sprite.position.set(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE);
  }

  /**
   * todoWIP, UNFINISHED (needs to be able to move strategically based on PC last seen location
   * 
   * Moves monster.
   * If PC has been seen, move strategically towards last seen location.
   * Else (if PC not seen yet or last seen PC location has been explored) the monster wanders.
   */
  move() {
    //this.canSeePC();
    if(!this.targetAquired) {
      this.wander();
    } else {
      //move strategically, to be implemented later when PC is on map WIP
      console.log("omw bro");
    }
  }

  /**
   * todoWIP, UNFINISHED (need to actually implement target health loss)
   * 
   * Monster attacks PC
   * @param {*} PCid id for player that monster is attacking
   */
  attack(PCid) {
    let msg = " attacked player "; // SEND TO JACOB FOR IMPLEMENTATION open to suggestions tho
    //(decrement pc health and check for pc death) within PC's beAttacked method
    // below: psuedo until PC is implemented
    this.map.PC[PCid].beAttacked(this.damage);
    console.log(this.name + msg + PCid);
  }

  /**
   * todoWIP, UNFINISHED
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
   * todoWIP drop items down the road
   * 
   * Monster dies.
   */
  die() {
    // remove sprite
    // remove from monsters array
    // drop item
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
    let randomDiffX = Math.floor(Math.random() * (this.map.rooms[this.initialRoom].width / BLOCK_SIZE)); 
    this.x = (this.map.rooms[this.initialRoom].x / BLOCK_SIZE) + randomDiffX;
    let randomDiffY = Math.floor(Math.random() * (this.map.rooms[this.initialRoom].height / BLOCK_SIZE)); 
    this.y = (this.map.rooms[this.initialRoom].y / BLOCK_SIZE) + randomDiffY;
  }
} 