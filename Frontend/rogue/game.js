/* global PIXI */
import {KEY_CODES} from "../input.js";

let app = new PIXI.Application({
  antialias: true
});

document.body.appendChild(app.view);

// make the game fill the window
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;

const DIMS = 48;

const MAP_SIZE = +location.hash || 1000;

let map = new Uint8Array(MAP_SIZE ** 2);

// generate a random map
for(let i = 0; i < map.length; ++i) {
  map[i] = Math.floor(Math.random() * 3);
}

let mapX = 0;
let mapY = 0;

let sprites = [];

const setup = () => {
  sprites.forEach((sprite) => {
    app.stage.removeChild(sprite);
  });

  let {blueBig, lightGreyBig, purpleBig} = PIXI.loader.resources.floor.textures;

  let getTile = (x, y) => {
    switch(map[x + y * MAP_SIZE]) {
    case 0:
      return blueBig;
    case 1:
      return lightGreyBig;
    default:
      return purpleBig;
    }
  };

  let iLen = Math.min(app.renderer.width / DIMS, MAP_SIZE);
  let jLen = Math.min(app.renderer.height / DIMS, MAP_SIZE);

  let iOff = Math.floor(mapX / DIMS);
  let jOff = Math.floor(mapY / DIMS);

  for(let i = -1; i < iLen + 1; ++i) {
    for(let j = -1; j < jLen + 1; ++j) {
      let tile = new PIXI.Sprite(getTile(i + iOff, j + jOff));

      tile.position.set(i * DIMS + (mapX % DIMS), j * DIMS + (mapY % DIMS));
      app.stage.addChild(tile);
      sprites.push(tile);
    }
  }
};

const resetMapXY = () => {
  if(mapX < 0) mapX = 0;
  if(mapY < 0) mapY = 0;

  if(mapX > MAP_SIZE * DIMS) mapX = MAP_SIZE * DIMS;
  if(mapY > MAP_SIZE * DIMS) mapY = MAP_SIZE * DIMS;
};

window.addEventListener("keydown", (e) => {
  switch(e.keyCode) {
  case KEY_CODES.UP_ARROW:
    --mapY;
    break;
  case KEY_CODES.DOWN_ARROW:
    ++mapY;
    break;
  case KEY_CODES.LEFT_ARROW:
    --mapX;
    break;
  case KEY_CODES.RIGHT_ARROW:
    ++mapX;
    break;
  }

  resetMapXY();

  setup();
});

const onresize = () => {
  app.renderer.resize(innerWidth, innerHeight);

  // rerender the screen on resize if we have loaded the assets already
  if(PIXI.loader.resources.floor) {
    setup();
  }
};

onresize();

// load the textures
PIXI.loader
  .add("floor", "../DawnLike/Objects/Floor.json")
  .load(setup);


/*
// This code is used for making texture atlases 
window.Builder = class {
  constructor() {
    this.map = {};
  }

  toString() {
    return JSON.stringify(this.map);
  }

  add() {
    let {name, x, y, w, h} = this.last;

    this.map[`${name}.png`] = {
      frame: { x, y, w, h },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w, h },
      sourceSize: { w, h },
      pivot: { x: 0.5, y: 0.5 }
    };
  }

  show(img, name, x, y, w, h) {
    if(this.sprite) {
      app.stage.removeChild(this.sprite);
    }

    this.last = {name, x, y, w, h};

    let {texture} = PIXI.loader.resources[img];
    texture.frame = new PIXI.Rectangle(x, y, w, h);
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.position.set(0, 0);
    this.sprite.scale.set(2, 2);
    app.stage.addChild(this.sprite);
  }
};

window.b = new window.Builder();
*/