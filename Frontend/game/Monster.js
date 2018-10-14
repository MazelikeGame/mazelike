/* eslint-disable no-extra-parens,max-len,curly,no-console,complexity */
/* global PIXI */
/** @module Monster */

import GameMap from "/shared/game-map.mjs";
//import game from "./game.js";

const BLOCK_SIZE = 48;

export default class Monster {
  
  constructor(name_in, hp_in, damage_in) {
    this.name = name_in;
    this.hp = hp_in;
    this.damage = damage_in;
    this.targetAquired = false; // if monster knows where a player is
    this.x = 6;
    this.y = 3;
    //PCx: -1; // -1 if not seen yet
    //PCy: -1;

    this.sprite = new PIXI.Sprite(PIXI.loader.resources.dog.textures["0-0"]);
    this.sprite.position.set(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE);
    this.sprite.width = BLOCK_SIZE;
    this.sprite.height = BLOCK_SIZE;

    this.create();
  }
  canSeePC() {
    // if can see player
    // set PCx and PCy
    this.targetAquired = true;
  }
  wander() { // if PC not seen yet OR last seen PC location has been explored
    // need to check for collisions/ make sure its a floor piece, WIP
    
    var random = Math.floor(Math.random() * 4); 
    if(random === 0 && GameMap.isOnMap(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE))
      this.x += 1;
    else if(random === 1 && GameMap.isOnMap(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE))
      this.x -= 1;
    else if(random === 2 && GameMap.isOnMap(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE))
      this.y += 1;
    else if(random === 3 && GameMap.isOnMap(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE))
      this.y -= 1;
    this.sprite.position.set(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE);
    //setInterval(this.wander(), 1000);
  }
  move() {
    if(!this.targetAquired) {
      this.wander();
    } else {
      //move strategically, to be implemented later when PC is on map WIP
    }
  }
  attack(target) {
    var msg = " attacked ";
    console.log(this.name + msg + target);
    // implement damage later when PC is on map WIP
  }
  create() {
    var msg = " created.";
    console.log(this.name + msg);
    this.wander();
  }
  die() {
    //clearInterval(alive); WIP
  }
  updateSprite(xPage, yPage) {
    this.sprite.position.set((this.x * BLOCK_SIZE) - xPage, (this.y * BLOCK_SIZE) - yPage);
  }
} 