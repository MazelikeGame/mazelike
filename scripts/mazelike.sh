#!/bin/bash

# Allow users to run sh
if [ "$1" == "sh" ]; then
  exec /bin/ash
fi

# Run the log processing script
if [ "$1" == "log" ]; then
  shift
  exec tail -n +0 -f /data/mazelike.log | node scripts/log-parser $*
fi

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      cat <<"EOF"
Usage: mazelike [options]

sh               Start ${os.platform() === "win32" ? "cmd" : "ash"} for debugging
-h, --help       Show this message
-v, --verbose    Print all database queries
--version        Print the current version
EOF
      exit
      ;;
    
    --version|cat) # cat for backwards compatability
      cat VERSION
      exit
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

./node_modules/.bin/sequelize db:migrate

if [ $? -ne 0 ]; then
  exit $?
fi

exec node --experimental-modules Backend/index.mjs