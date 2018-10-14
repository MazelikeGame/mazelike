/* eslint-disable no-extra-parens,max-len,curly */
/* global PIXI */
/** @module Monster */

import GameMap from "/shared/game-map.mjs";
export default class Monster {
  
  constructor(name_in, hp_in, damage_in) {
    this.name = name_in;
    this.hp = hp_in;
    this.damage = damage_in;
    this.targetAquired = false; // if monster knows where a player is
    this.x = 0;
    this.y = 0;
    //PCx: -1; // -1 if not seen yet
    //PCy: -1;

    this.sprite = new PIXI.Sprite(PIXI.loader.resources.dog.textures["0-0"]);
    this.sprite.position.set((this.x * GameMap.BLOCK_SIZE) - GameMap.xMin, (this.y * GameMap.BLOCK_SIZE) - GameMap.yMin);
    this.sprite.width = GameMap.BLOCK_SIZE;
    this.sprite.height = GameMap.BLOCK_SIZE;

    // this.sprite = new PIXI.Text("m", this._textStyle);
    // this.sprite.setText("m");
    // this.x = 3;
    // this.y = 3;
    // this.sprite.position.set((this.x * GameMap.BLOCK_SIZE) - GameMap.xMin, (this.y * GameMap.BLOCK_SIZE) - GameMap.yMin);
    // this.sprite.style.fill = 0xFFFFFF;

    this.create();
  }
  canSeePC() {
    // if can see player
    // set PCx and PCy
    this.targetAquired = true;
  }
  wander() { // if PC not seen yet OR last seen PC location has been explored
    // need to check for collisions/ make sure its a floor piece, WIP
    
    // var random = Math.floor(Math.random() * 4); 
    // if(random === 0)
    //   this.x += 1;
    // else if(random === 1)
    //   this.x -= 1;
    // else if(random === 2)
    //   this.y += 1;
    // else if(random === 3)
    //   this.y -= 1;
    // setInterval(this.wander(), 1000);
  }
  move() {
    if(!this.targetAquired) {
      this.wander();
    } else {
      //move strategically, to be implemented later when PC is on map
    }
  }
  attack(target) {
    var msg = " attacked ";
    alert(this.name + msg + target);
    // implement damage later when PC is on map
  }
  create() {
    var msg = " created.";
    alert(this.name + msg);
    // place on map
  }
  die() {
    //clearInterval(alive);
  }
}