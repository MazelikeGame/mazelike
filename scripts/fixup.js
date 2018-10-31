const fs = require("fs");

let version = fs.readFileSync("VERSION", "utf8");

if(version.indexOf("--- DO NOT MODIFY ---") !== -1) {
  process.exit(0);
}

let pkg = require("/app/package.json");
pkg.version = version;
fs.writeFileSync("/app/package.json", JSON.stringify(pkg, null, 2));

let pkgLock = require("/app/package-lock.json");
pkgLock.version = version;
fs.writeFileSync("/app/package-lock.json", JSON.stringify(pkgLock, null, 2));