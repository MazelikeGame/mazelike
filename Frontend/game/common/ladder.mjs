export default class LadderCommon {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  placeInRandomRoom(map) {
    let randomRoom = map.rooms[Math.floor(Math.random() * map.rooms.length)];
    this.x = randomRoom.x + Math.floor(randomRoom.width / 2);
    this.y = randomRoom.y + Math.floor(randomRoom.height / 2);
  }
}
