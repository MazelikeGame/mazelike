/* global PIXI  */
/* eslint-disable complexity */
import GameMap from "./game-map.js";
import {KEY_CODES} from "./input.js";

let app = new PIXI.Application({
  antialias: true
});

document.body.appendChild(app.view);

// make the game fill the window
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;

window.onresize = () => {
  app.renderer.resize(innerWidth, innerHeight);
};

window.onresize();

let pageX = 0;
let pageY = 0;

window.addEventListener("keydown", (e) => {
  if(e.keyCode === KEY_CODES.UP_ARROW) {
    --pageY;
    if(pageY < 0) {
      pageY = 0;
    }
  }
  
  if(e.keyCode === KEY_CODES.DOWN_ARROW) {
    ++pageY;
    if(pageY > 10000) {
      pageY = 10000;
    }
  }
   
  if(e.keyCode === KEY_CODES.LEFT_ARROW) {
    --pageX;
    if(pageX < 0) {
      pageX = 0;
    }
  }
  
  if(e.keyCode === KEY_CODES.RIGHT_ARROW) {
    ++pageX;
    if(pageX > 10000) {
      pageX = 10000;
    }
  }
});

function setup() {
  let map = GameMap.generate();
  let sprites = [];
  let lastRender = Date.now();

  let fpsMsg = new PIXI.Text("Fps");
  fpsMsg.position.set(10, 10);
  app.stage.addChild(fpsMsg);

  app.ticker.add(() => {
    let frameTime = Date.now() - lastRender;
    fpsMsg.setText(`${frameTime}ms (${Math.round(1000 / frameTime)}fps)`);
    lastRender = Date.now();

    while(sprites.length) {
      app.stage.removeChild(sprites.pop());
    }

    for(let m of map.getMapFor(pageX, pageY, innerWidth + pageX, innerHeight + pageY)) {
      let s = new PIXI.Sprite(PIXI.loader.resources.floor.textures[m.type]);
      s.position.set(m.x - pageX, m.y - pageY);
      app.stage.addChild(s);
      sprites.push(s);
    }

    app.stage.removeChild(fpsMsg);
    app.stage.addChild(fpsMsg);
  });
}

// load the textures
PIXI.loader
  .add("floor", "DawnLike/Objects/Floor.json")
  .load(setup);
