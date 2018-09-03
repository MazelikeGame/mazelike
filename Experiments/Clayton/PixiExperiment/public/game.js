//Pixi.JS Setup
const app = new PIXI.Application(800, 600, {backgroundColor: 0x1099bb});
document.body.appendChild(app.view);

/**
 * Setup
 */
function init()
{
    var helloText = new PIXI.Text('Hello World');
    helloText.x = 10;
    helloText.y = 10;
    app.stage.addChild(helloText);

    app.ticker.add(delta => loop(delta));
}

/**
 * Game Loop
 * @param {} deltaTime 
 */
function loop(deltaTime)
{
    //console.log("deltaTime: " + deltaTime);
}

init();