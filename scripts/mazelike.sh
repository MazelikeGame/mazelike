#!/bin/bash

# Allow users to run sh
if [ "$1" == "sh" ]; then
  exec /bin/ash
fi

isGameServer="no"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      cat <<"EOF"
Usage: mazelike [options]

sh               Start ${os.platform() === "win32" ? "cmd" : "ash"} for debugging
-h, --help       Show this message
-v, --verbose    Print all database queries
-d, --docker     Run the game server instances as separate containers
--version        Print the current version
-g, --game       Start a game server
-t, --tag <tag>  The tag to use for spawning game servers (automatically sets -d)
                    ex: ryan3r/mazelike`);
EOF
      exit
      ;;
    
    -d|--docker)
      export CLUSTER_MANAGER="docker"
      ;;
    
    --version|cat) # cat for backwards compatability
      cat VERSION
      exit
      ;;
    
    -t|--tag)
      shift
      export CLUSTER_MANAGER="docker"
      export IMAGE_NAME=$1;
      ;;
    
    -g|--game)
      isGameServer="yes";
      ;;
    
    -v|--verbose)
      export LOG_LEVEL="debug"
      ;;
    
    *)
      echo "Unknown argument $1"
      ;;
  esac

  shift
done

# Set docker defaults
if [ -z "$CLUSTER_MANAGER" ]; then
  export CLUSTER_MANAGER="single"
fi

if [ -z "$NODE_ENV" ]; then
  export NODE_ENV="production"
fi

if [ -z "$DB" ]; then
  export DB="sqlite:///data/mazelike.sqlite"
fi

if [ -z "$PUBLIC_DIR" ]; then
  export PUBLIC_DIR="/data"
fi

export LOG_FILE="/data/mazelike.log";

cat <<"EOF"
___  ___                  _  _  _         
|  \/  |                 | |(_)| |        
| .  . |  __ _  ____ ___ | | _ | | __ ___ 
| |\/| | / _` ||_  // _ \| || || |/ // _ \
| |  | || (_| | / /|  __/| || ||   <|  __/
\_|  |_/ \__,_|/___|\___||_||_||_|\_\___|

EOF

if [ "$isGameServer" == "yes" ]; then
  exec node --experimental-modules Backend/game.mjs
else
  ./node_modules/.bin/sequelize db:migrate

  if [ $? -ne 0 ]; then
    exit $?
  fi

  exec node --experimental-modules Backend/index.mjs
fi