import "./logger.js"; // THIS MUST BE THE FIRST IMPORT
import startMinion from "./multi/minion";
import {initHost} from "./multi/host";
import startMaster from "./main";

if(process.env.MAZELIKE_MASTER && process.env.MAZELIKE_EXTERN_ADDR) {
  startMinion();
} else {
  initHost();
  startMaster();
}