/* eslint-disable complexity */
/* global PIXI */
/** @module browser/Floor */
import FloorCommon from "../common/floor.mjs";
import GameMap from "./game-map.mjs";
import Monster from "./monster.mjs";

export default class Floor extends FloorCommon {
  constructor(gameId, floorIdx, sock) {
    super(gameId, floorIdx);
    this.sock = sock;
    // the top left corrner of the user's screen
    this._viewportX = 0;
    this._viewportY = 0;
  }

  /**
   * Generate a new floor (runs on the server and the browser)
   * @param gameId The game id for the game we want to generate
   * @param floorIdx The index of floor we want to generate
   * @param {object} opts The options of the specific generators
   */
  static generate({gameId, floorIdx, map, sock}) {
    let floor = new Floor(gameId, floorIdx, sock);

    floor.map = GameMap.generate(map);

    floor.generateMonsters();

    floor._initRendering();

    return floor;
  }

  /**
   * Puts a monster in half of all "rooms".
   * Occurs twice upon floor generation, shouldnt cause errors though.
   * @param {Floor} floor The floor to add monsters to
   */
  generateMonsters() {
    this.monsterSprites = new PIXI.Container();
    this.monsters = [];
    let random = 0;
    for(let i = 0; i < this.map.rooms.length * this.monsterRatio; i++) { 
      random = Math.floor(Math.random() * 100); 
      if(random < 5) { // 5% chance for blue demon
        this.monsters[i] = new Monster('blue demon', 150, 10, this, i, 'blue');
      } else if(random < 45) { // 40% chance for red demon, where 5+40 = 45
        this.monsters[i] = new Monster('red demon', 100, 5, this, i, 'red');
      } else if(random < 100) { // 55% chance for green demon, where 5+40+55 = 100
        this.monsters[i] = new Monster('green demon', 50, 5, this, i, 'green');
      }
    }
  }

  /**
   * Load everything in the browser
   * @param gameId The game id for the game we want to load
   * @param floorIdx The index of floor we want to load
   */
  static async load(gameId, floorIdx, sock) {
    let floor = new Floor(gameId, floorIdx, sock);

    await Promise.all([
      // NOTE: You should define your functions here and they should
      // return a promise for when they compl2ete.  All modifications to
      // floor should be done to the floor variable you pass in like so.
      GameMap.load(floor)
    ]);

    floor.generateMonsters();

    floor._initRendering();

    return floor;
  }

  save() {
    this.sock.emit("save");

    return new Promise((resolve) => {
      this.sock.once("save-complete", resolve);
    });
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
    
    for(let i = 0; i < this.monsters.length; i++) {
      this.monsters[i].createSprite();
    }
    this.sprite.addChild(this.monsterSprites);
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
    for(let i = 0; i < this.monsters.length; i++) {
      this.monsters[i].update(this._viewportX, this._viewportY);
    }
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