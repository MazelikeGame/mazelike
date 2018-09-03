import { Player } from './player.js';
import { Keyboard } from './keyboard.js';

//Pixi.JS Setup
const app = new PIXI.Application(800, 600, {backgroundColor: 0x1099bb});
document.body.appendChild(app.view);

// Switch to this: http://pixijs.download/dev/docs/PIXI.Spritesheet.html

var player = new Player("Clay", 5, 5, new PIXI.Sprite.fromImage('./images/player.png'));
var usernameText = new PIXI.Text(player.username);

/**
 * Setup
 */
function init()
{
    var input = new Keyboard(player);

    var helloText = new PIXI.Text('Hello World');
    helloText.x = 10;
    helloText.y = 10;
    app.stage.addChild(helloText);

    app.stage.addChild(player.sprite);
    console.log(player.username);

    
    usernameText.x = player.x;
    usernameText.y = player.y + 10;
    app.stage.addChild(usernameText);
    
    app.ticker.add(delta => loop(delta));
}

/**
 * Game Loop
 * @param {} deltaTime 
 */
function loop(deltaTime)
{
    usernameText.x = player.x;
    usernameText.y = player.y;
    //console.log("deltaTime: " + deltaTime);
}

PIXI.loader.load(init);
