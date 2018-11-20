import * as child from "./manager-child";
import * as docker from "./manager-docker";
import * as single from "./manager-single";

let exp;

console.log(process.env.CLUSTER_MANAGER); // eslint-disable-line
switch(process.env.CLUSTER_MANAGER) {
case "none":
  exp = {
    getGameAddr: () => {},
    spawnGame: () => {}
  };
  break;

case "docker":
  exp = docker;
  break;

case "single":
  exp = single;
  break;

default:
  exp = child;
  break;
}

export let getGameAddr = exp.getGameAddr;
export let spawnGame = exp.spawnGame;