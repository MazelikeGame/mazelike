/* global PIXI */
let app = new PIXI.Application({
  antialias: true
});

document.body.appendChild(app.view);

// make the game fill the window
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;

let onresize = window.onresize = () => {
  app.renderer.resize(innerWidth, innerHeight);
};

onresize();

let prevFrame;
let pos = {
  x: 0,
  y: 0,
  w: 0,
  h: 0
};

window.save = function(name) {
  if(!name) {
    return "No name given";
  }

  window.result.frames[name] = {
    "frame": {
      "x": pos.x,
      "y": pos.y,
      "w": pos.w,
      "h": pos.h
    },
    "rotated": false,
    "trimmed": false,  "spriteSourceSize": {
      "x": pos.x,
      "y": pos.y,
      "w": pos.w,
      "h": pos.h
    },
    "sourceSize": {
      "w": pos.w,
      "h": pos.h
    },
    "pivot": {
      "x": 0.5,
      "y": 0.5
    }
  };

  return "Ok";
};

let downName;

window.download = function() {
  if(!downName) {
    return "No name given";
  }

  let blob = new Blob([JSON.stringify(window.result, null, 2)], { type: "application/json" });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${downName}.json`;
  a.click();

  return "Ok";
};

window.pick = function(name, file) {
  downName = name;
  PIXI.loader
    .add("img", `DawnLike/${file}.png`)
    .load(setup);
  
  window.result = {
    meta: {
      image: `DawnLike/${file}.png`
    },
    frames: {}
  };
};

function setup() {
  if(prevFrame) {
    app.stage.removeChild(prevFrame);
  }

  let t = PIXI.loader.resources.img.texture;
  t.frame = new PIXI.Rectangle(pos.x, pos.y, pos.w, pos.h);
  let frame = new PIXI.Sprite(t);
  app.stage.addChild(frame);

  prevFrame = frame;
}

for(let k of Object.keys(pos)) {
  Object.defineProperty(window, k, {
    get() {
      return pos[k];
    },
    set(v) {
      pos[k] = v;
      setup();
    }
  });
}
