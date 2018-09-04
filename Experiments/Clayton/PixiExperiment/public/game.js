import { Player } from './player.js';
import { Keyboard } from './keyboard.js';

//https://github.com/kittykatattack/learningPixi

//Pixi.JS Setup
const app = new PIXI.Application(500, 500, {
    backgroundColor: 0xFFFFFF,
});

document.body.appendChild(app.view);

// Switch to this: http://pixijs.download/dev/docs/PIXI.Spritesheet.html

var objects = []; //I don't need this. Pixi keeps an array of children.

//Can split this into map.js
//Will probably want terrain type saved in array.
function generateMap()
{
    const tiles = PIXI.TextureCache["./images/Floor.png"]; //Tile texture

    //Grass Dark
    const grassDarkRectangle = new PIXI.Rectangle(128, 160, 16, 16);
    const grassDarkTexture = new PIXI.Texture(tiles, grassDarkRectangle);

    //Normal Grass
    const grassRectangle = new PIXI.Rectangle(128, 110, 16, 16);
    const grassTexture = new PIXI.Texture(tiles, grassRectangle);

    for(var x = 0; x < 500; x++)
    {
        for(var y = 0; y < 500; y++)
        {
            if(((x % 16) == 0) && ((y % 16) == 0))
            {
                let random = Math.floor((Math.random() * 10) + 1);

                if(random % 2)
                {
                    var temp = new PIXI.Sprite(grassDarkTexture);
                } else {
                    var temp = new PIXI.Sprite(grassTexture);
                }
                temp.x = x;
                temp.y = y;
                app.stage.addChild(temp);
            }
        }
    }
}

/**
 * Setup
 */
function init()
{
    generateMap();

    var nameText = new PIXI.Text('Hello World',
    {
        fontFamily: "Arial",
        fontSize: 11
    });
    
    nameText.x = 0;
    nameText.y = 20;
    app.stage.addChild(nameText);

    objects.push(nameText);

    //Player Sprite
    let texture = PIXI.TextureCache["./images/Player0.png"];
    let rectangle = new PIXI.Rectangle(0, 0, 16, 16);
    texture.frame = rectangle;

    //Player #1
    var player = new Player("Clay", 5, 5, new PIXI.Sprite(texture));
    app.stage.addChild(player.sprite);
    objects.push(player);

    //Player #2
    var player2 = new Player("Clay2", 20, 25, new PIXI.Sprite(texture));
    app.stage.addChild(player2.sprite);
    
    var input = new Keyboard(player); //Input
    
    app.ticker.add(delta => loop(delta)); //Game loop
}

/**
 * Game Loop
 * @param {} deltaTime 
 */
function loop(deltaTime)
{
    objects[0].y = objects[1].y + 15;
    objects[0].x = objects[1].x - objects[0].text.length;
}

PIXI.loader.add("./images/Player0.png").add("./images/Floor.png").load(init);
