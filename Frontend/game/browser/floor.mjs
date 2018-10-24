/* eslint-disable complexity */
/* global PIXI */
/** @module browser/Floor */
import FloorCommon from "../common/floor.mjs";
import GameMap from "./game-map.mjs";
import Monster from "./monster.mjs";

export default class Floor extends FloorCommon {
  constructor(gameId, floorIdx) {
    super(gameId, floorIdx);
    // the top left corner of the user's screen
    this._viewportX = 0;
    this._viewportY = 0;
  }

  /**
   * Generate a new floor (runs on the server and the browser)
   * @param gameId The game id for the game we want to generate
   * @param floorIdx The index of floor we want to generate
   * @param {object} opts The options of the specific generators
   */
  static generate({gameId, floorIdx, map}) {
    let floor = new Floor(gameId, floorIdx);

    floor.map = GameMap.generate(map);

    floor.generateMonsters();

    floor._initRendering();

    return floor;
  }

  /** katie
   * Puts a monster in half of all "rooms".
   * @param {Floor} floor The floor to add monsters to
   */
  generateMonsters() {
    this.monsters = [];
    for(let i = 0; i < this.map.rooms.length / 2; i++) { 
      this.monsters[i] = new Monster('sir spoopy', 100, 10, this, i, 1);
    }
  }

  /**
   * Load everything in the browser
   * @param gameId The game id for the game we want to load
   * @param floorIdx The index of floor we want to load
   */
  static async load(gameId, floorIdx) {
    let floor = new Floor(gameId, floorIdx);

    await Promise.all([
      // NOTE: You should define your functions here and they should
      // return a promise for when they complete.  All modifications to
      // floor should be done to the floor variable you pass in like so.
      GameMap.load(floor),
      //this.monsters.load(floor) // todo
    ]);
    //todo issue here katie
    floor._initRendering();

    return floor;
  }

  save() {
    // stub: no use for this yet
  }

  /**
   * Do any rendering setup and add all sprites to the stage
   */
  _initRendering() {
    this.sprite = new PIXI.Container();

    // Move the viewport to the spawn point
    let spawn = this.map.getSpawnPoint();
    this.setViewport(spawn.x, spawn.y);

    this._mapRenderer = this.map.createRenderer();
    this.sprite.addChild(this._mapRenderer.sprite);
    
    this.monsters[0].createAllSprites(); // katie
  }

  /**
   * Render/update the game
   */
  update() {
    this._mapRenderer.update(
      this._viewportX,
      this._viewportY,
      this._viewportX + innerWidth,
      this._viewportY + innerHeight
    );
    this.monsters[0].update(this._viewportX, this._viewportY); // katie
  }

  /**
   * Set the viewport of the cient (ie the coordiates for the center of their screen)
   * @param {number} x
   * @param {number} y
   */
  setViewport(x, y) {
    let halfWidth = innerWidth / 2;
    let halfHeight = innerHeight / 2;

    this._viewportX = Math.max(x - halfWidth, 0);
    this._viewportY = Math.max(y - halfHeight, 0);
  }

  /**
   * Get the current viewport
   * @returns {object} {x, y}
   */
  getViewport() {
    let halfWidth = innerWidth / 2;
    let halfHeight = innerHeight / 2;

    return {
      x: this._viewportX + halfWidth,
      y: this._viewportY + halfHeight
    };
  }

}