/* global PIXI io */
import {KeyHandler, KEY_CODES} from "./input.js";

let sock = io(location.host);

let gameId = location.pathname.match(/\/game\/(.+)/)[1];

let app = new PIXI.Application({
  antialias: true
});

document.body.appendChild(app.view);

// make the game fill the window
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;

let onresize = () => {
  app.renderer.resize(innerWidth, innerHeight);
};

onresize();

/**
 * VelocityMod takes an object, a direction, an up and a down key.
 * VelocityMod sets object.direction to 1 when up keys is pressed and to -1
 * when the down key is pressed.
 */
class VelocityMod extends KeyHandler {
  constructor(object, direction, upKey, downKey) {
    super(upKey, downKey);
    this.obj = object;
    this.dir = direction;
    this.upKey = upKey;

    this.obj[this.dir] = 0;
  }

  onDown(key) {
    this.obj[this.dir] = key === this.upKey ? 1 : -1;
  }

  onUp() {
    this.obj[this.dir] = 0;
  }
}

// the width and height of the grass square
const GRASS_WIDTH = 45;
const GRASS_HEIGHT = 41;

const updatePlayers = (players, dogTexture) => {
  for(let [_, player] of players) { // eslint-disable-line no-unused-vars
    if(!player.sprite) {
      player.sprite = new PIXI.Sprite(dogTexture);
      player.sprite.scale.set(2, 2);
      app.stage.addChild(player.sprite);
    }

    player.sprite.position.set(player.x, player.y);
  }
};

function setup() {
  // get the grass texture from the sprite sheet
  let grassTexture = PIXI.loader.resources.floor.texture;
  grassTexture.frame = new PIXI.Rectangle(114, 52, GRASS_WIDTH, GRASS_HEIGHT);

  // render the ground
  for(let y = 0; y < innerHeight; y += GRASS_HEIGHT) {
    for(let x = 0; x < innerWidth; x += GRASS_WIDTH) {
      let floor = new PIXI.Sprite(grassTexture);

      floor.x = x;
      floor.y = y;

      app.stage.addChild(floor);
    }
  }

  let dogTexture = PIXI.loader.resources.dog.texture;
  dogTexture.frame = new PIXI.Rectangle(0, 0, 16, 16);

  let dog = new PIXI.Sprite(dogTexture);

  // position the dog
  dog.x = Math.floor(Math.random() * app.stage.width / 2);
  dog.y = Math.floor(Math.random() * app.stage.height / 2);

  dog.scale.set(2, 2);

  // bind the dogs velocity values (vx and vy) to the arrow keys
  new VelocityMod(dog, "vx", KEY_CODES.RIGHT_ARROW, KEY_CODES.LEFT_ARROW);
  new VelocityMod(dog, "vy", KEY_CODES.DOWN_ARROW, KEY_CODES.UP_ARROW);

  app.stage.addChild(dog);

  let id;
  let players = new Map();

  // move the dog based on its velocity every 60th of a second
  app.ticker.add(() => {
    dog.x += dog.vx;
    dog.y += dog.vy;

    updatePlayers(players, dogTexture);

    if(id && (dog.vx !== 0 || dog.vy !== 0)) {
      sock.emit("position", {
        id,
        gameId,
        x: dog.x,
        y: dog.y
      });
    }
  });

  sock.on("id", (_id) => {
    id = _id;

    sock.emit("position", {
      id,
      gameId,
      x: dog.x,
      y: dog.y
    });
  });

  sock.emit("ready", gameId);

  sock.on("set", (pos) => {
    if(pos.id === id || pos.gameId !== gameId) {
      return;
    }

    if(players.has(pos.id)) {
      Object.assign(players.get(pos.id), pos);
    } else {
      players.set(pos.id, pos);
    }
  });

  sock.on("remove", ({gameId: _gameId, id: _id}) => {
    if(_gameId !== gameId) {
      return;
    }

    let player = players.get(_id);
    if(player) {
      app.stage.removeChild(player.sprite);
    }

    players.delete(_id);
  });
}

// load the textures
PIXI.loader
  .add("floor", "DawnLike/Objects/Floor.png")
  .add("dog", "DawnLike/Characters/Dog0.png")
  .load(setup);
