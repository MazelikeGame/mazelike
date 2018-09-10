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

function setup() {
  // Courtesy of Ryan
  let dogTexture = PIXI.loader.resources.dog.texture;
  dogTexture.frame = new PIXI.Rectangle(0, 0, 16, 16);
  let dog = new PIXI.Sprite(dogTexture);
  dog.x = 10;
  dog.y = 10;
  // Courtesy of Ryan
  app.stage.addChild(dog);
}

// Add textures
PIXI.loader
  .add("dog", "images/Dog0.png")
  .load(setup);
