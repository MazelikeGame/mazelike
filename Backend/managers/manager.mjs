import * as child from "./manager-child";
import * as docker from "./manager-docker";

let exp;

switch(process.env.CLUSTER_MANAGER) {
case "docker":
  exp = docker;
  break;

default:
  exp = child;
  break;
}

export let getGameAddr = exp.getGameAddr;
export let spawnGame = exp.spawnGame;