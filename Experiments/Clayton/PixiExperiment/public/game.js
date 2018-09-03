import Player from './player.js';

//Pixi.JS Setup
const app = new PIXI.Application(800, 600, {backgroundColor: 0x1099bb});
document.body.appendChild(app.view);

// Switch to this: http://pixijs.download/dev/docs/PIXI.Spritesheet.html

var sprite = new PIXI.Sprite.fromImage('./images/player.png');

var player = new Player("Clay", 5, 5, sprite);

/**
 * Setup
 */
function init()
{
    var helloText = new PIXI.Text('Hello World');
    helloText.x = 10;
    helloText.y = 10;
    app.stage.addChild(helloText);
    app.stage.addChild(sprite);


    app.ticker.add(delta => loop(delta));
    console.log(player.username);
}

/**
 * Game Loop
 * @param {} deltaTime 
 */
function loop(deltaTime)
{
    player.sprite.x += 1;
    //console.log("deltaTime: " + deltaTime);
}

init();