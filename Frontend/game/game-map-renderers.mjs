/* global PIXI */
import GameMap from "./game-map.mjs";

// support old maps
let defaultRenderer = GameMap.createTileRenderer("floor", "-box-big");

defaultRenderer.canRender = () => {
  return false;
};

GameMap.register(defaultRenderer);

// New specialized renderers
GameMap.register({
  name: "smooth-renderer",
  
  canRender() {
    return true;
  },

  render({x, y, width, height, map}) {
    let texture = PIXI.loader.resources.floor.textures[`${map.getTheme()}-box-big`].clone();
    let defaultFrame = texture.frame;
    
    let tWidth = defaultFrame.width - 12;
    let tHeight = defaultFrame.height - 12;

    texture.frame = new PIXI.Rectangle(texture.frame.x + 6, texture.frame.y + 6, tWidth, tHeight);

    let container = new PIXI.Container();

    for(let i = 0; i < width; i += tWidth) {
      for(let j = 0; j < height; j += tHeight) {
        let sprite = new PIXI.Sprite(texture);

        sprite.position.set(i - x, j - y);
        sprite.width = tWidth;
        sprite.height = tHeight;
        container.addChild(sprite);
      }
    }

    return container;
  }
});