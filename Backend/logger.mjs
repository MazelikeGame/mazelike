/* eslint-disable arrow-body-style */
import bunyan from "bunyan";
import os from "os";

let logger = bunyan.createLogger({
  name: "mazelike",
  streams: [{
    level: "info",
    stream: process.stdout
  }, {
    type: "rotating-file",
    path: `/data/logs/${os.hostname()}.log`,
    period: "1d",
    count: 3,
    level: process.env.NODE_ENV === "production" ? "info" : "debug"
  }],
  serializers: {
    err: bunyan.stdSerializers.err,
  
    floor: function(floor) {
      return floor.id;
    },
  
    player: playerSerial,
    players: function(players) {
      return players.map(playerSerial);
    },
  
    monster: monsterSerial,
    monsters: function(monsters) {
      return monsters.map(monsterSerial);
    }
  }
});

function playerSerial(player) {
  return {
    name: player.name,
    x: player.x,
    y: player.y,
    vx: player.vx,
    vy: player.vy,
    hp: player.hp
  };
}

function monsterSerial(monster) {
  return {
    name: monster.name,
    hp: monster.hp,
    targetAquired: monster.targetAquired,
    targetx: monster.targetx,
    targety: monster.targety,
    x: monster.x,
    y: monster.y,
    lastAttackTime: monster.lastAttackTime
  };
}

let nextReqId = 1;
export function httpLogs(req, res, next) {
  // Set up the logger for this request and log when the request comes in
  req.logger = logger.child({ req_id: nextReqId++ });
  req.logger.info({method: req.method, url: req.url, query: req.query}, `${req.method} ${req.url}`);
  let start = Date.now();

  res.on("finish", () => {
    let data = {
      status: res.statusCode,
      type: res.getHeader("Content-Type"),
      res_time: Date.now() - start
    };

    if(res.statusCode === 302) {
      data.redirect = res.getHeader("location");
    }

    req.logger.info(data, `Respond ${res.statusCode} ${req.url} in ${data.res_time}ms`);
  });

  next();
}

// NOTE: I use a global because dynamic import is not supported in node 8.11
global.ml || (global.ml = {}); // eslint-disable-line
global.ml.logger = logger;