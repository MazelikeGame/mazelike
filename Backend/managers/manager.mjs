import child from "./manager-child";
import docker from "./manager-docker";

let spawn;

if(process.env.CLUSTER_MANAGER === "docker") {
  spawn = docker;
} else {
  spawn = child;
}

export default spawn;