#!/bin/bash

cat <<"EOF"
___  ___                  _  _  _         
|  \/  |                 | |(_)| |        
| .  . |  __ _  ____ ___ | | _ | | __ ___ 
| |\/| | / _` ||_  // _ \| || || |/ // _ \
| |  | || (_| | / /|  __/| || ||   <|  __/
\_|  |_/ \__,_|/___|\___||_||_||_|\_\___|
EOF

# Allow users to run sh
if [ "$1" == "sh" ]; then
  exec /bin/ash
fi

rm /data/logs/$(hostname).log

  export DB_DEBUG="no"
  # let isGameServer = false;

  # // Parse command line arguments
  # for(let i = 2; i < process.argv.length; ++i) {
  #   switch(process.argv[i]) {
  #     case "-h":
  #     case "--help":
  #       console.log(`Usage: mazelike [options]

  # sh               Start ${os.platform() === "win32" ? "cmd" : "ash"} for debugging
  # -h, --help       Show this message
  # -v, --verbose    Print all database queries
  # -d, --docker     Run the game server instances as separate containers
  # --version        Print the current version
  # -g, --game       Start a game server
  # -t, --tag <tag>  The tag to use for spawning game servers (automatically sets -d)
  #                     ex: ryan3r/mazelike`);
  #       return;

  #     case "-v":
  #     case "--verbose":
  #       process.env.DB_DEBUG = "yes";
  #       break;
      
  #     case "-d":
  #     case "--docker":
  #       process.env.CLUSTER_MANAGER = "docker";
  #       break;
      
  #     case "--version":
  #     case "cat": // for backwards compatability
  #       console.log(fs.readFileSync("VERSION", "utf8").trim());
  #       process.exit(0);
  #       break;
      
  #     case "-t":
  #     case "--tag":
  #       process.env.CLUSTER_MANAGER = "docker";
  #       process.env.IMAGE_NAME = process.argv[++i];

  #       if(i === process.argv.length || process.env.IMAGE_NAME[0] === "-") {
  #         console.log(`Expected docker image/tag but got ${process.env.IMAGE_NAME}`);
  #         process.exit(0);
  #       }
  #       break;
      
  #     case "-g":
  #     case "--game":
  #       isGameServer = true;
  #       break;
      
  #     default:
  #       console.log(`Unknown argument ${process.argv[i]}`);
  #       break;
  #   }
  # }

  # // Set docker defaults
  # if(!process.env.CLUSTER_MANAGER) {
    export CLUSTER_MANAGER="single"
  # }

  # if(process.env.NODE_ENV) {
    export NODE_ENV="production"
  # }

  # if(!process.env.DB) {
    export DB="sqlite:///data/mazelike.sqlite"
  # }

  # if(!process.env.PUBLIC_DIR) {
    export PUBLIC_DIR="/data"
  # }

  mkdir -p /data/logs

  # console.log(logo);

  # if(isGameServer) {
  #   await exec("node", "--experimental-modules", "Backend/game.mjs");
  # } else {
    ./node_modules/.bin/sequelize db:migrate
    exec node --experimental-modules Backend/index.mjs | ./node_modules/.bin/bunyan -L -o short
  # }
# })();