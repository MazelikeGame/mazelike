const fs = require("fs");

let version = fs.readFileSync("VERSION", "utf8");

if(version.indexOf("--- DO NOT MODIFY ---") !== -1) {
  process.exit(0);
}

let pkg = require("./package.json");
pkg.version = version;
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));

let pkgLock = require("./package-lock.json");
pkgLock.version = version;
fs.writeFileSync("package-lock.json", JSON.stringify(pkgLock, null, 2));