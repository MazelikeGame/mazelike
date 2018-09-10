import { Player } from './player.js';
import { Keyboard } from './keyboard.js';

//https://github.com/kittykatattack/learningPixi

//Pixi.JS Setup
const app = new PIXI.Application(800, 800, {
    backgroundColor: 0xFFFFFF,
});

document.body.appendChild(app.view);

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

    for(var x = 0; x < app.renderer.width; x++)
    {
        for(var y = 0; y < app.renderer.width; y++)
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

    //Player Sprite
    let texture = PIXI.TextureCache["./images/Player0.png"];
    let rectangle = new PIXI.Rectangle(0, 0, 16, 16);
    texture.frame = rectangle;

    //Player #1
    var player = new Player("Clay", 5, 5, new PIXI.Sprite(texture));
    app.stage.addChild(player.sprite);
    objects.push(player);

    var nameText = new PIXI.Text(player.username,
    {
        fontFamily: "Arial",
        fontSize: 11
    });

    nameText.x = 0;
    nameText.y = 20;
    app.stage.addChild(nameText);

    objects.push(nameText);


    //Player #2
    var player2 = new Player("Clay2", 250, 250, new PIXI.Sprite(texture));
    app.stage.addChild(player2.sprite);

    objects.push(player2);
    
    var input = new Keyboard(player); //Input for now... need to redo this.

    app.ticker.add(delta => loop(delta)); //Game loop
    
    setInterval(moveNPC, 500);
}

function moveNPC()
{
    let random = Math.floor((Math.random() * 4) + 1);

    switch(random)
    {
        case 1:
            objects[2].setY = objects[2].y + 1 * 2;
            break;
        case 2:
            objects[2].setY = objects[2].y - 1 * 2;
            break;
        case 3:
            objects[2].setX = objects[2].x + 1 * 2;
            break;
        case 4:
            objects[2].setX = objects[2].x - 1 * 2;
            break;
    }
}

/**
 * Game Loop
 * @param {} deltaTime 
 */
function loop(deltaTime)
{
    objects[1].y = objects[0].y + 15;
    objects[1].x = objects[0].x - objects[1].text.length;
}

PIXI.loader.add("./images/Player0.png").add("./images/Floor.png").load(init);
