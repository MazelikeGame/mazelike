const child_process = require("child_process");

let procs = new Set();

function spawnBuild(target) {
  let child = child_process.spawn("docker-compose", ["-f", "docker-compose.test.yml", "build", target]);

  let out = `Build ${target}\n`;

  const collect = function(data) {
    out += data.toString();
  };

  child.stdout.on("data", collect);
  child.stderr.on("data", collect);

  procs.add(child);

  return new Promise((resolve, reject) => {
    child.on("close", (code) => {
      console.log(out);
      procs.delete(child);

      if(code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}

Promise.all([
  spawnBuild("backend"),
  spawnBuild("tests")
])

.catch((code) => {
  for(const proc of procs) {
    proc.kill();
  }
  
  process.exit(code);
});