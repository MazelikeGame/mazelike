/* global m */
import * as child from "./manager-child";
import * as docker from "./manager-docker";
import * as single from "./manager-single";

let exp;

ml.logger.debug(`Using manager ${process.env.CLUSTER_MANAGER || "child"}`, ml.tags.manager);

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