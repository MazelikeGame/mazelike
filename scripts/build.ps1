param(
  [switch]$devel,
  [switch]$latest
)

$TAG = "ryan3r/mazelike:$(cat VERSION)-$(docker version -f "{{.Server.Os}}")"

if($devel) {
  $TAG = "mazelike"
}

if("$(docker version -f "{{.Server.Os}}")" -eq "windows") {
  docker build --build-arg BASE=stefanscherer/node-windows:8.11 --build-arg DATA="C:\data" -t $TAG .
}
else {
  docker build -t $TAG .
}

if(!$devel) {
  docker push $TAG
}

if($latest) {
  $VERSION = $(cat VERSION)
  # Create manifest for images
  docker manifest create ryan3r/mazelike:$VERSION ryan3r/mazelike:$VERSION-windows ryan3r/mazelike:$VERSION-linux
  docker manifest push -p ryan3r/mazelike:$VERSION
  # Create manifest for latest
  docker manifest create ryan3r/mazelike:latest ryan3r/mazelike:$VERSION-windows ryan3r/mazelike:$VERSION-linux
  docker manifest push -p ryan3r/mazelike:latest
}