import { Player } from './player.js';
import { Keyboard } from './keyboard.js';

//https://github.com/kittykatattack/learningPixi

//Pixi.JS Setup
const app = new PIXI.Application(500, 500, {backgroundColor: 0xFFFFFF});
document.body.appendChild(app.view);

// Switch to this: http://pixijs.download/dev/docs/PIXI.Spritesheet.html

var objects = [];

/**
 * Setup
 */
function init()
{

    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 11
    });
    var nameText = new PIXI.Text('Hello World', style);
    nameText.x = 10;
    nameText.y = 20;
    app.stage.addChild(nameText);

    objects.push(nameText);

    var player = new Player("Clay", 5, 5, new PIXI.Sprite.fromImage('./images/player.png'));
    app.stage.addChild(player.sprite);
    objects.push(player);
    
    var input = new Keyboard(player);
    app.ticker.add(delta => loop(delta));
}

/**
 * Game Loop
 * @param {} deltaTime 
 */
function loop(deltaTime)
{
    objects[0].y = objects[1].y + 15;
    objects[0].x = objects[1].x;
    //console.log("deltaTime: " + deltaTime);
}

PIXI.loader.load(init);
