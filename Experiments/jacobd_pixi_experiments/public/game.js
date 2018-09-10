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

let dog; let state; let wall;
function setup() {
  let dogTexture = PIXI.loader.resources.dog.texture;
  dogTexture.frame = new PIXI.Rectangle(0, 0, 16, 16);
  dog = new PIXI.Sprite(dogTexture);
  dog.x = 110;
  dog.y = 110;
  dog.vx = 0;
  dog.vy = 0;

  let wallTexture = PIXI.loader.resources.wall.texture;
  wallTexture.frame = new PIXI.Rectangle(0, 0, 16, 16);
  wall = new PIXI.Sprite(wallTexture);
  wall.x = 150;
  wall.y = 110;

  //Left arrow key `press` method
  left.press = () => {
    //Change the dog's velocity when the key is pressed
    dog.vx = -1;
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
    dog.vy = -1;
    dog.vx = 0;
  };
  up.release = () => {
    if (!down.isDown && dog.vx === 0) {
      dog.vy = 0;
    }
  };

  //Right
  right.press = () => {
    dog.vx = 1;
    dog.vy = 0;
  };
  right.release = () => {
    if (!left.isDown && dog.vy === 0) {
      dog.vx = 0;
    }
  };

  //Down
  down.press = () => {
    dog.vy = 1;
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
  app.stage.addChild(wall);
}

function gameLoop(delta, sprite) {
  sprite.x += delta;
  state(delta);
}

function play(delta) {
  if(hitTestRectangle(dog, wall)) {
    wall.x = dog.x + (50 * dog.vx);
    wall.y = dog.y + (50 * dog.vy);
  }
  dog.y += dog.vy;
  dog.x += dog.vx;
}

function hitTestRectangle(r1, r2) {

  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};

// Add textures
PIXI.loader
  .add("dog", "images/Dog0.png")
  .add("boot", "images/Boot.png")
  .add("wall", "images/Wall.png")
  .load(setup);
