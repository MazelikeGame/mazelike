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

    this.monsters = [];
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

  /** katie occurs twice, shouldnt cause errors tho
   * Puts a monster in half of all "rooms".
   * @param {Floor} floor The floor to add monsters to
   */
  generateMonsters() {
    this.monsters = [];
    for(let i = 0; i < this.map.rooms.length * this.monsterRatio; i++) { 
      this.monsters[i] = new Monster('sir spoopy', 100, 10, this, i, 1);
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
      this.monsters[i].update(this._viewportX, this._viewportY); // katie
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

  /**
   * Update our state to match the server's state
   */
  handleState(state) {
    this._diffState("id", this.monsters, state.monsters, (raw) => {
      let monster = new Monster("sir snoopy", raw.hp, 10, this, raw.id, raw.type);
      monster.setCoodinates(raw.x, raw.y);
      return monster;
    });
  }

  /**
   * Take an array of objects and update it to match another array (keeps objects with matching ids)
   * @param {string} idKey The property to use as a key
   * @param {object[]} current The current array of objects
   * @param {object[]} wanted The array of objects we want
   * @param {function} create A function that creates an instance of a current object
   *                          from an instance of a wanted object
   */
  _diffState(idKey, current, wanted, create) {
    // add ids to a map for quick lookups
    let wantedIds = new Map();
    for(let obj of wanted) {
      wantedIds.set(obj[idKey], obj);
    }

    for(let i = 0; i < current.length; ++i) {
      let obj = current[i];

      // already have an instance update it
      if(wantedIds.has(obj[idKey])) {
        obj.handleState(wantedIds.get(obj[idKey]));
        wantedIds.delete(obj[idKey]);
      } else {
        // unwanted instance (delete)
        current.splice(i, 1);
        --i;
        obj.remove(this.sprite);
      }
    }

    // create missing objects
    for(let wantedObj of wantedIds) {
      current.push(create(wantedObj));
    }
  }
}