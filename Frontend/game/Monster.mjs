/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity */
/* global PIXI */
/** @module Monster */

const BLOCK_SIZE = 48;

export default class Monster {
  
  constructor(name_in, hp_in, damage_in, map_in) {
    this.name = name_in;
    this.hp = hp_in;
    this.damage = damage_in;
    this.map = map_in;
    this.targetAquired = false; // "in pursuit" boolean
    this.x = 5;
    this.y = 5;
    //PCx: -1; // -1 if not seen yet
    //PCy: -1;

    this.placeInRandomRoom();

    this.sprite = new PIXI.Sprite(PIXI.loader.resources.dog.textures["0-0"]);
    this.sprite.position.set(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE);
    this.sprite.width = BLOCK_SIZE;
    this.sprite.height = BLOCK_SIZE;
  }

  /** WIP, UNFINISHED (needs to be implemented)
   *   - need PC to be implemented
   * Updates targetAquired field, which is true if we're currently in pursuit.
   * If PC is in sight, PCx and PCy will be updated (last known location coordinates)
   */
  canSeePC() {
    this.targetAquired = false;
  }

  /** 2WIP, UNFINISHED (need to check for collisions for items/player/other monsters)
   * Monster moves to an adjacent, unoccupied location.
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
    if(!this.map.isOnMap(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE)) { // wont wander off map
      this.x = prevX;
      this.y = prevY;
      this.wander();
    }
    this.sprite.position.set(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE);
  }

  /** WIP, UNFINISHED (needs to be able to move strategically based on PC last seen location)
   *   - need PC to be implemented
   * Moves monster.
   * If PC has been seen, move strategically towards last seen location.
   * Else (if PC not seen yet or last seen PC location has been explored) the monster wanders.
   */
  move() {
    if(!this.targetAquired) {
      this.wander();
    } else {
      //move strategically, to be implemented later when PC is on map WIP
    }
  }

  /** WIP, UNFINISHED (need to actually implement target health loss)
   *   - need PC to be implemented
   * Monster attacks PC
   * @param {*} target id for player that monster is attacking
   */
  attack(target) {
    let msg = " attacked ";
    console.log(this.name + msg + target);
  }

  /**
   * Updates sprite so that it the sprite appears to "stick" to map rather than move around with screen like FpsCounter.
   * @param {*} xPage the upper left x coordinate of the page (0 if unshifted)
   * @param {*} yPage the upper left y coordinate of the page (0 if unshifted)
   */
  updateSprite(xPage, yPage) {
    this.sprite.position.set((this.x * BLOCK_SIZE) - xPage, (this.y * BLOCK_SIZE) - yPage);
  }

  /** 1WIP, UNFINISHED (need to add: place monster in a room WITHOUT other monsters)
   * Places monster in a random room.
   */
  placeInRandomRoom() {
    let numRooms = this.map.rooms.length;
    this.initialRoom = Math.floor(Math.random() * numRooms); 
    let randomDiffX = Math.floor(Math.random() * (this.map.rooms[this.initialRoom].width / BLOCK_SIZE)); 
    this.x = (this.map.rooms[this.initialRoom].x / BLOCK_SIZE) + randomDiffX;
    let randomDiffY = Math.floor(Math.random() * (this.map.rooms[this.initialRoom].height / BLOCK_SIZE)); 
    this.y = (this.map.rooms[this.initialRoom].y / BLOCK_SIZE) + randomDiffY;
  }
} 