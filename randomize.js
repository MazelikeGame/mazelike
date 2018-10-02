const fs = require("fs");

let compose = fs.readFileSync("docker-compose.test.yml", "utf8");
let test = fs.readFileSync("test.Dockerfile", "utf8");
let random = Math.floor(Math.random() * 100000);

test = test.replace("mazelike/backend:devel", `mazelike/backend:devel-${random}`);
compose = compose.replace("mazelike/backend:devel", `mazelike/backend:devel-${random}`);
compose = compose.replace("mazelike/tests", `mazelike/tests:${random}`);

fs.writeFileSync("test.Dockerfile", test);
fs.writeFileSync("docker-compose.test.yml", compose);
fs.writeFileSync("random", `${random}`);