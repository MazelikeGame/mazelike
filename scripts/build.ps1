if("$(docker version -f "{{.Server.Os}}")" -eq "windows") {
  docker build --build-arg BASE=stefanscherer/node-windows:8.11 --build-arg DATA="C:\data" -t ryan3r/mazelike:$(cat VERSION) .
}
else {
  docker build -t ryan3r/mazelike:$(cat VERSION) .
}