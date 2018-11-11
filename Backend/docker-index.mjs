// Set docker defaults
if(!process.env.CLUSTER_MANAGER) {
  process.env.CLUSTER_MANAGER = "docker";
}

if(!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

if(!process.env.DB_HOST && !process.env.DB_STORAGE) {
  process.env.DB_STORAGE = "/data/mazelike.sqlite";
}

if(!process.env.PUBLIC_DIR) {
  process.env.PUBLIC_DIR = "/data";
}