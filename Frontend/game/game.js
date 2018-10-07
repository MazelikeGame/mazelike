/* global PIXI  */
/* eslint-disable complexity */
import GameMap from "./game-map.js";
import {KEY_CODES} from "./input.js";
import FpsCounter from "./fps-counter.js";

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

let panTimer;

window.ml.stopPan = function() {
  clearInterval(panTimer);
};

window.ml.startPan = function() {
  clearInterval(panTimer);
  panTimer = setInterval(() => {
    ++pageX;
    ++pageY;
  }, 1000 / 48);
};

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
  let fps = new FpsCounter();

  app.ticker.add(() => {
    while(sprites.length) {
      app.stage.removeChild(sprites.pop());
    }

    for(let m of map.getMapFor(pageX, pageY, innerWidth + pageX, innerHeight + pageY)) {
      let s = new PIXI.Sprite(PIXI.loader.resources.floor.textures[m.type]);
      s.position.set(m.x - pageX, m.y - pageY);
      app.stage.addChild(s);
      sprites.push(s);
    }

    fps.render(app);
  });
}

// load the textures
PIXI.loader
  .add("floor", "DawnLike/Objects/Floor.json")
  .load(setup);
