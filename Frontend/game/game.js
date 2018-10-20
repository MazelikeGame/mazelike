/* global PIXI  */
/* eslint-disable complexity */
import Floor from "./browser/floor.mjs";
import "./game-map-renderers.mjs";
import {KEY_CODES} from "./input.js";
import FpsCounter from "./fps-counter.js";

let gameIdMatch = location.pathname.match(/\/game\/(.+?)(?:\?|\/|$)/);
let gameId = gameIdMatch && gameIdMatch[1];

let devMode = location.hostname === "localhost";

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

let pageX = 0;
let pageY = 0;

window.addEventListener("keydown", (e) => {
  if(e.keyCode === KEY_CODES.UP_ARROW) {
    pageY -= 10;
    if(pageY < 0) {
      pageY = 0;
    }
  }
  
  if(e.keyCode === KEY_CODES.DOWN_ARROW) {
    pageY += 10;
    if(pageY > 10000) {
      pageY = 10000;
    }
  }
   
  if(e.keyCode === KEY_CODES.LEFT_ARROW) {
    pageX -= 10;
    if(pageX < 0) {
      pageX = 0;
    }
  }
  
  if(e.keyCode === KEY_CODES.RIGHT_ARROW) {
    pageX += 10;
    if(pageX > 10000) {
      pageX = 10000;
    }
  }

  // Toggle devmode
  if(e.which === 68 /* d */) {
    devMode = !devMode;

    if(devMode) {
      app.stage.addChild(fps.sprite);
    } else {
      app.stage.removeChild(fps.sprite);
    }
  }
});

async function setup() {
  if(gameId) {
    startGame(await Floor.load(gameId, 0));
  } else {
    startGame(Floor.generate({
      gameId,
      floorIdx: 0
    }));
  }
}

let fps = new FpsCounter();

function startGame(floor) {
  window.ml.floor = floor;
  
  let spawn = floor.map.getSpawnPoint();
  /* eslint-disable no-extra-parens */
  pageX = Math.max(spawn.x - (innerWidth / 2), 0);
  pageY = Math.max(spawn.y - (innerHeight / 2), 0);
  /* eslint-enable no-extra-parens */

  let mapSprite = floor.map.createSprite();

  app.stage.addChild(mapSprite.sprite);
  
  if(devMode) {
    app.stage.addChild(fps.sprite);
  }

  app.ticker.add(() => {
    mapSprite.update(pageX, pageY, innerWidth + pageX, innerHeight + pageY);

    if(devMode) {
      fps.update();
    }
  });
}

// load the textures
PIXI.loader
  .add("floor", "DawnLike/Objects/Floor.json")
  .load(setup);
