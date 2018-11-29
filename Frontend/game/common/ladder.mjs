/*global PIXI*/

export default class LadderCommon {

  constructor() {
    this.x = 0;
    this.y = 0;
    this.sprite = new PIXI.Sprite.fromImage('DawnLike/Objects/ladder.png');
    this.sprite.position.set(this.x, this.y);
  }
  /** 
   * Places monster in a random "room" with no other monsters.
   */
  placeInRandomRoom() {
    let numRooms = this.floor.map.rooms.length;
    this.initialRoom = Math.floor(Math.random() * numRooms);
    
    let randomDiffX = Math.floor(Math.random() * this.floor.map.rooms[this.initialRoom].width); 
    //this.x = this.floor.map.rooms[this.initialRoom].x + randomDiffX;
    let randomDiffY = Math.floor(Math.random() * this.floor.map.rooms[this.initialRoom].height); 
    //this.y = this.floor.map.rooms[this.initialRoom].y + randomDiffY;
    //this.setPosition(x, y);
  }
}
