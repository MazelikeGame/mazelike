/* global PIXI */
/** @module Player */
const SPRITE_SIZE = 48;

/**
 * TODO: Have Player inherit from class Character. Same goes for Monster class.
 */
export default class Player {
  constructor(name, hp, map, id) {
    this.name = name;
    this.hp = hp;
    this.map = map;
    this.id = id;
    this.xPos = 0;
    this.yPos = 0;
  }

  /**
   * Generate sprite for player
   */
  createSprite() {
    this.sprite = new PIXI.Sprite(PIXI.loader.resources.player.textures['player1']);
    this.sprite.position.set(this.x, this.y);
    this.sprite.width = SPRITE_SIZE;
    this.sprite.height = SPRITE_SIZE;
  }
  // placeInRandomRoom() {
  //   let numRooms = this.map.rooms.length;
  //   this.initalRoom = Math.floor(Math.random() * numRooms);
  // }
}
