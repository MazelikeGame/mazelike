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
    count: 3
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
    },
  
    req: function(req) {
      return {
        path: req.path,
        query: req.query,
        method: req.method
      };
    },
  
    res: function(res) {
      let raw = {
        statusCode: res.statusCode
      };

      if(res.statusCode === 302) {
        raw.redirect = res.getHeader("location");
      }

      return raw;
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

// NOTE: I use a global because dynamic import is not supported in node 8.11
global.ml || (global.ml = {}); // eslint-disable-line
global.ml.logger = logger;