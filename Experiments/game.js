let app = new PIXI.Application({
    width: 300,
    height: 300,
    antialias: true
});

document.body.appendChild(app.view);

app.renderer.backgroundColor = 0xffffff; //0x061639;

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
(onresize = () => app.renderer.resize(innerWidth, innerHeight))();

PIXI.loader
    .add("floor", "DawnLike/Objects/Floor.png")
    .add("dog", "DawnLike/Characters/Dog0.png")
    .load(setup);

const GRASS_WIDTH = 39;
const GRASS_HEIGHT = 35;

function setup() {
    let grassTexture = PIXI.loader.resources.floor.texture;
    grassTexture.frame = new PIXI.Rectangle(116, 55, GRASS_WIDTH, GRASS_HEIGHT);

    let dogTexture = PIXI.loader.resources.dog.texture;
    dogTexture.frame = new PIXI.Rectangle(0, 0, 16, 16);

    for(let y = 0; y < innerHeight; y += GRASS_HEIGHT) {
        for(let x = 0; x < innerHeight; x += GRASS_WIDTH) {
            let floor = new PIXI.Sprite(grassTexture);

            floor.x = x;
            floor.y = y;

            app.stage.addChild(floor);
        }
    }

    let dog = new PIXI.Sprite(dogTexture);

    dog.x = 0;
    dog.y = 0;

    onmousemove = e => {
        dog.position.set(e.clientX, e.clientY);
    };

    onmousewheel = e => {
        dog.width = Math.min(64, Math.max(16, dog.width + e.deltaY));
        dog.height = Math.min(64, Math.max(16, dog.height + e.deltaY));
    };

    dog.anchor.x = 0.5;
    dog.anchor.y = 0.5;

    let timer;
    onclick = () => {
        clearInterval(timer);
        timer = setInterval(() => {
            dog.rotation += 0.1;

            if(dog.rotation >= 2 * Math.PI) {
                dog.rotation = 0;
                clearInterval(timer);
            }
        }, 10);
    };

    app.stage.addChild(dog);

    app.renderer.render(app.stage);
}
