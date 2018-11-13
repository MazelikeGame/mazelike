param(
  [switch]$devel,
  [switch]$latest
)

$TAG = "ryan3r/mazelike:$(cat VERSION)"

if($devel) {
  $TAG = "mazelike"
}

if("$(docker version -f "{{.Server.Os}}")" -eq "windows") {
  docker build --build-arg BASE=stefanscherer/node-windows:8.11 --build-arg DATA="C:\data" -t $TAG .
}
else {
  docker build -t $TAG .
}

if($latest) {
  docker tag $TAG ryan3r/mazelike:latest
}