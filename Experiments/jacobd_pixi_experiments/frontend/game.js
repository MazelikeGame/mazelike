/* global PIXI */
let app = new PIXI.Application();
document.body.appendChild(app.view);
app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.autoResize = true;

let onresize = () => {
  app.renderer.resize(innerWidth, innerHeight);
};
onresize();

app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.backgroundColor = 0x6dcff6;

// Add textures
function setup() {
  let PCSprite = new PIXI.Sprite(
    PIXI.loader.resources['../resources/DawnLike/Characters/Player0.png'].texture
  );
  app.stage.addChild(PCSprite);
}

PIXI.loader
  .add('../resources/DawnLike/Characters/Player0.png')
  .load(setup);
