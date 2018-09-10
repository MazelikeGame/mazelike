import { keyboard } from './keyboard.js';
/* global PIXI */

// Init app
let app = new PIXI.Application({
  antialias: true,
  transparent: false,
  resolution: 1
});
document.body.appendChild(app.view);

// Resizing window
app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.autoResize = true;
let onresize = () => {
  app.renderer.resize(innerWidth, innerHeight);
};
onresize();
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.backgroundColor = 0x6dcff6;

//Capture the keyboard arrow keys

let left = keyboard(37),
  up = keyboard(38),
  right = keyboard(39),
  down = keyboard(40);

let dog; let state;
function setup() {
  let dogTexture = PIXI.loader.resources.dog.texture;
  dogTexture.frame = new PIXI.Rectangle(0, 0, 16, 16);
  dog = new PIXI.Sprite(dogTexture);
  dog.x = 150;
  dog.y = 150;
  dog.vx = 0;
  dog.vy = 0;

  //Left arrow key `press` method
  left.press = () => {
    //Change the dog's velocity when the key is pressed
    dog.vx = -5;
    dog.vy = 0;
  };

  //Left arrow key `release` method
  left.release = () => {
    //If the left arrow has been released, and the right arrow isn't down,
    //and the dog isn't moving vertically:
    //Stop the dog
    if (!right.isDown && dog.vy === 0) {
      dog.vx = 0;
    }
  };

  //Up
  up.press = () => {
    dog.vy = -5;
    dog.vx = 0;
  };
  up.release = () => {
    if (!down.isDown && dog.vx === 0) {
      dog.vy = 0;
    }
  };

  //Right
  right.press = () => {
    dog.vx = 5;
    dog.vy = 0;
  };
  right.release = () => {
    if (!left.isDown && dog.vy === 0) {
      dog.vx = 0;
    }
  };

  //Down
  down.press = () => {
    dog.vy = 5;
    dog.vx = 0;
  };
  down.release = () => {
    if (!up.isDown && dog.vx === 0) {
      dog.vy = 0;
    }
  };
  state = play;

  document.addEventListener('keydown', (event) => {
    let bootTexture = PIXI.loader.resources.boot.texture;
    bootTexture.frame = new PIXI.Rectangle(0, 0, 16, 16);
    let boot = new PIXI.Sprite(bootTexture);
    switch(event.keyCode) {
    case 32:
      app.ticker.add((delta) => {
        gameLoop(delta, boot);
      });
      boot.x = dog.x;
      boot.y = dog.y;
      app.stage.addChild(boot);
      break;
    }
  });
  app.stage.addChild(dog);
}

function gameLoop(delta, sprite) {
  sprite.x += delta;
  state(delta);
}

function play(delta) {
  dog.y += dog.vy;
  dog.x += dog.vx;
}

// Add textures
PIXI.loader
  .add("dog", "images/Dog0.png")
  .add("boot", "images/Boot.png")
  .load(setup);
