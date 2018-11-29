/* eslint-disable complexity */
/* global PIXI */
/** @module browser/Floor */
import FloorCommon from "../common/floor.mjs";
import GameMap from "./game-map.mjs";
import Player from "./player.mjs";
import Monster from "./monster.mjs";

export default class Floor extends FloorCommon {
  constructor(gameId, floorIdx, sock, username) {
    super(gameId, floorIdx);
    this.sock = sock;
    this.username = username;
    // the top left corrner of the user's screen
    this._viewportX = 0;
    this._viewportY = 0;

    this.monsters = [];
    this.monsterSprites = new PIXI.Container();

    this.players = [];
    this.playerSprites = new PIXI.Container();
    
    this.attackSprites = new PIXI.Container();
  }

  /**
   * Generate a new floor (runs on the server and the browser)
   * @param gameId The game id for the game we want to generate
   * @param floorIdx The index of floor we want to generate
   * @param {object} opts The options of the specific generators
   */
  static generate({gameId, floorIdx, map, sock, username}) {
    let floor = new Floor(gameId, floorIdx, sock, username);
    floor.map = GameMap.generate(map);

    floor._initRendering();

    return floor;
  }

  /**
   * Puts a monster in half of all "rooms".
   * Occurs twice upon floor generation, shouldnt cause errors though.
   * @param {Floor} floor The floor to add monsters to
   */
  generateMonsters() {
    this.monsters = [];
    let random = 0;
    for(let i = 0; i < this.map.rooms.length * this.monsterRatio; i++) {
      if(i === 0) {
        this.monsters[i] = new Monster('boss', 200, 15, this, i, 'boss');
      } else {
        random = Math.floor(Math.random() * 100);
        if(random < 15) { // 15% chance for blue demon
          this.monsters[i] = new Monster('blue demon', 150, 10, this, i, 'blue');
        } else if(random < 50) { // 35% chance for red demon, where 15+35 = 50
          this.monsters[i] = new Monster('red demon', 100, 5, this, i, 'red');
        } else if(random < 100) { // 50% chance for green demon, where 15+35+50 = 100
          this.monsters[i] = new Monster('green demon', 50, 5, this, i, 'green');
        }
      }
    }
  }

  /**
   * Load everything in the browser
   * @param gameId The game id for the game we want to load
   * @param floorIdx The index of floor we want to load
   * @param sock The connection to the game server
   * @param username The username of the current player
   */
  static async load(gameId, floorIdx, sock, username) {
    let floor = new Floor(gameId, floorIdx, sock, username);

    await Promise.all([
      // NOTE: You should define your functions here and they should
      // return a promise for when they compl2ete.  All modifications to
      // floor should be done to the floor variable you pass in like so.
      GameMap.load(floor),
    ]);

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

    this.sprite.addChild(this.attackSprites);

    for(let i = 0; i < this.monsters.length; i++) {
      this.monsters[i].createSprite();
    }
    for(let i = 0; i < this.players.length; ++i) {
      this.players[i].createSprite();
    }
    this.sprite.addChild(this.playerSprites);
    this.sprite.addChild(this.monsterSprites);
  }

  /**
   * Render/update the game
   */
  update() {
    for(let i = 0; i < this.monsters.length; i++) {
      this.monsters[i].update(this._viewportX, this._viewportY);
    }
    for(let i = 0; i < this.players.length; ++i) {
      this.players[i].update(this._viewportX, this._viewportY);
    }
    this._mapRenderer.update(
      this._viewportX,
      this._viewportY,
      this._viewportX + innerWidth,
      this._viewportY + innerHeight
    );
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
  handleState(state, username) {
    this._diffState("id", "id", this.monsters, state.monsters, (raw) => {
      let monster = new Monster(raw.name, raw.hp, 10, this, raw.id, raw.type);
      monster.setCoodinates(raw.x, raw.y);
      monster.createSprite();
      return monster;
    });
    this._diffState("username", 'name', this.players, state.players, (raw) => {
      let player = new Player(raw.username, raw.hp, raw.spriteName, this);
      player.handleState(raw);
      player.createSprite();
      player._lastFrameSent = raw._lastFrame;
      player.x = raw._confirmedX;
      player.y = raw._confirmedY;
      
      if(raw.username === username) {
        this.setViewport(player.x, player.y);
      }

      return player;
    });
  }

  /**
   * Take an array of objects and update it to match another array (keeps objects with matching ids)
   * @param {string} idRawKey The property to use as a key
   * @param {string} idKey The property to use as a key
   * @param {object[]} current The current array of objects
   * @param {object[]} wanted The array of objects we want
   * @param {function} create A function that creates an instance of a current object
   *                          from an instance of a wanted object
   */
  _diffState(idRawKey, idKey, current, wanted, create) {
    // add ids to a map for quick lookups
    let wantedIds = new Map();
    for(let obj of wanted) {
      wantedIds.set(obj[idRawKey], obj);
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
        obj.remove();
      }
    }

    // create missing objects
    for(let wantedObj of wantedIds) {
      current.push(create(wantedObj[1]));
    }
  }
}
