/* global PIXI  */
/* eslint-disable complexity */

import Floor from "./browser/floor.mjs";
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

    if(e.keyCode === 38 /* UP_ARROW */) {
      viewport.y -= 10;
    }
    
    if(e.keyCode === 40 /* DOWN_ARROW */) {
      viewport.y += 10;
    }
    
    if(e.keyCode === 37 /* LEFT_ARROW */) {
      viewport.x -= 10;
    }
    
    if(e.keyCode === 39 /* RIGHT_ARROW */) {
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

  // window.setInterval(function() { todo
  //   for(let i = 0; i < floor.monsters.length; i++) {
  //     floor.monsters[i].figureOutWhereToGo();
  //   }
  // }, 500);
  // window.setInterval(function() {
  //   for(let i = 0; i < floor.monsters.length; i++) {
  //     floor.monsters[i].move();
  //   }
  //   //floor.updateMonsters(pageX, pageY); // katie todo
  // }, 10);
  
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
  .add("dog", "DawnLike/Characters/dog.json")
  .add("demon", "DawnLike/Characters/demon.json")
  .add("player", "DawnLike/Characters/player.json")
  .load(setup);
