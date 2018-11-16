import gameMain from "../game.mjs";

let httpd;

export function setHttpd(_httpd) {
  httpd = _httpd;
}

export function spawnGame(gameEnv = {}) {
  gameEnv.MAZELIKE_port = "0";
  gameMain(gameEnv, httpd);
}

export function getGameAddr() {
  return "__current__";
}
