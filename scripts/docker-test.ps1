param([switch]$Fast)

$root = "$(git rev-parse --show-toplevel)"

docker-compose up -d mysql

# Rebuild both images if not in fast mode
if(!$Fast) {
  docker-compose build
  docker build -t mazelike/test $root -f scripts/test.Dockerfile
}

# Run the tests in docker
docker run --rm -t --network pp_3_backend -v "$root/spec:/app/spec" mazelike/test
