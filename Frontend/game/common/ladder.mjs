/* global ml */
/** @module LadderCommon */
export default class LadderCommon {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * Places the ladder in a random room.
   * @param map the game map
   */
  placeInRandomRoom(map) {
    let randomRoom = map.rooms[Math.floor(Math.random() * map.rooms.length)];
    this.x = randomRoom.x + Math.floor(randomRoom.width / 2);
    this.y = randomRoom.y + Math.floor(randomRoom.height / 2);

    ml.logger.debug(`Placed the ladder at (${this.x}, ${this.y})`, ml.tags.ladder);
  }

  /* eslint-disable complexity, no-mixed-operators */
  static collision(player, ladder) {
    let x = -1;
    let y = -1;

    for(let j = 0; j < 4; j++) { // four corners to check for each sprite
      switch(j) {
      case 0:
        x = player.x;
        y = player.y;
        break;
      case 1:
        x = player.x + 48 * player.size;
        y = player.y;
        break;
      case 2:
        x = player.x + 48 * player.size;
        y = player.y + 48 * player.size;
        break;
      case 3:
        x = player.x;
        y = player.y + 48 * player.size;
        break;
      }
    
      if(x >= ladder.x && x <= ladder.x + 48 * player.size) { // within x bounds
        if(y >= ladder.y && y <= ladder.y + 48 * player.size) { // and within y bounds
          ml.logger.debug(`Player at (${player.x}, ${player.y}) collided with ladder at (${ladder.x}, ${ladder.y})`, ml.tags.ladder);
        }
      }
    }
  }
}