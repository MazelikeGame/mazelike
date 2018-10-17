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
    let visionIncomplete = true;
    for(let i = 0; i < this.map.numPCs; i++) {
      while(visionIncomplete) {

        visionIncomplete = false;
      }
    }
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
      if(redo)
        console.log("redo");
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
    this.canSeePC();
    if(!this.targetAquired) {
      this.wander();
    } else {
      //move strategically, to be implemented later when PC is on map WIP
    }
  }

  /**
   * todoWIP, UNFINISHED (need to actually implement target health loss)
   * 
   * Monster attacks PC
   * @param {*} target id for player that monster is attacking
   */
  attack(target) {
    let msg = " attacked ";
    console.log(this.name + msg + target);
  }

  /**
   * todoWIP, UNFINISHED
   * 
   * Monster attacks PC
   */
  beAttacked(hp) {
    let msg = " was attacked, -";
    console.log(this.name + msg + hp);
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