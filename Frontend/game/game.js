/* global PIXI  */
/* eslint-disable complexity */
import Floor from "./browser/floor.mjs";
import {KEY_CODES} from "./input.js";
import FpsCounter from "./fps-counter.js";

let gameIdMatch = location.pathname.match(/\/game\/(.+?)(?:\?|\/|$)/);
let gameId = gameIdMatch && gameIdMatch[1];

let app = new PIXI.Application({
  antialias: true
});

document.body.appendChild(app.view);

// make the game fill the window
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;

window.onresize = () => {
  app.renderer.resize(innerWidth - 1, innerHeight - 1);
};

window.onresize();

// This should be removed once player controls the viewport
const addArrowKeyListener = (floor) => {
  window.addEventListener("keydown", (e) => {
    let viewport = floor.getViewport();

    if(e.keyCode === KEY_CODES.UP_ARROW) {
      viewport.y -= 10;
    }
    
    if(e.keyCode === KEY_CODES.DOWN_ARROW) {
      viewport.y += 10;
    }
    
    if(e.keyCode === KEY_CODES.LEFT_ARROW) {
      viewport.x -= 10;
    }
    
    if(e.keyCode === KEY_CODES.RIGHT_ARROW) {
      viewport.x += 10;
    }

    floor.setViewport(viewport.x, viewport.y);
  });
};

async function setup() {
  let floor;

  if(gameId) {
    floor = await Floor.load(gameId, 0);
  } else {
    floor = Floor.generate({
      gameId,
      floorIdx: 0
    });
  }

  app.stage.addChild(floor.sprite);

  // Show the fps counter on dev machines
  let fps;
  if(location.hostname === "localhost") {
    fps = new FpsCounter();
    app.stage.addChild(fps.sprite);
  }

  window.ml.floor = floor;
  addArrowKeyListener(floor);
  
  app.ticker.add(() => {
    floor.update();

    if(fps) {
      fps.update();
    }
  });
}

// load the textures
PIXI.loader
  .add("floor", "DawnLike/Objects/Floor.json")
  .load(setup);
