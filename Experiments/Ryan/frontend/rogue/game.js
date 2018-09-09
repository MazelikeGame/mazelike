/* global PIXI */
import {KeyHandler, KEY_CODES} from "../input.js";

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

let setup = () => {

};

// load the textures
PIXI.loader
  .add("floor", "../DawnLike/Objects/Floor.png")
  .add("dog", "../DawnLike/Characters/Dog0.png")
  .load(setup);

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