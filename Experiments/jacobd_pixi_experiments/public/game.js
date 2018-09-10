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

let dog;
let boot;
function setup() {
  app.ticker.add(delta => gameLoop(delta));
  let bootTexture = PIXI.loader.resources.boot.texture;
  bootTexture.frame = new PIXI.Rectangle(0, 0, 16, 16);
  boot = new PIXI.Sprite(bootTexture);
  let dogTexture = PIXI.loader.resources.dog.texture;
  dogTexture.frame = new PIXI.Rectangle(0, 0, 16, 16);
  dog = new PIXI.Sprite(dogTexture);
  dog.x = 150;
  dog.y = 150;

  document.addEventListener('keydown', (event) => {
    if(event.keyCode === 32) {
      boot.x = dog.x;
      boot.y = dog.y;
      app.stage.addChild(boot);
    }
  });
  app.stage.addChild(dog);
}

function gameLoop(delta) {
  //Move the dog 1 pixel
  boot.x += 1;
}

// Add textures
PIXI.loader
  .add("dog", "images/Dog0.png")
  .add("boot", "images/Boot.png")
  .load(setup);
