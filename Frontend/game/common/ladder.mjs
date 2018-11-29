export default class LadderCommon {
  constructor(floor) {
    this.x = 0;
    this.y = 0;
    this.floor = floor;
  }

  /** 
   * Places the ladder in a random "room".
   */
  placeInRandomRoom() {
    let numRooms = this.floor.map.rooms.length;
    let initialRoom = Math.floor(Math.random() * numRooms);
    let randomDiffX = Math.floor(Math.random() * this.floor.map.rooms[initialRoom].width); 
    this.x = this.floor.map.rooms[initialRoom].x + randomDiffX;
    let randomDiffY = Math.floor(Math.random() * this.floor.map.rooms[initialRoom].height); 
    this.y = this.floor.map.rooms[initialRoom].y + randomDiffY;
  }
}
