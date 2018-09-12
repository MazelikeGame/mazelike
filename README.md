# MazeLike

## Run the server

The first time you run this you should start with `docker-compose up mysql`.  You should see some logs fly across the screen when they stop type `CTRL^C`.

To start mysql and the backend run `docker-compose up`.

You can then navigate to http://localhost:3000/ in your browser.  For docker toolbox you will need to navigate to http://YOUR_DOCKER_IP_HERE:3000/.  You can get your docker machine ip by running `docker-machine ip` in the docker command prompt.

NOTE: You can run `docker-compose ps` to see if any containers are running and `docker-compose stop` to stop all containers.

## Testing

The best option is running the tests in docker to do that run `scripts/docker-test`.  This will rebuild the testing and backend containers and run `npm test`.  If you are just modifying the specs you can run `scripts/docker-test -fast` which will skip the builds and just run the tests.  If you have any issues with changes to your code not showing up the first thing you should do is run it without the `-fast` flag.  

Also run `docker-compose stop` after you are done because the docker tests start mysql but they do not stop it.

## Generate documentation

Run `npm run doc`

## Rollback the server to a previous version

1. Ssh into the server
2. Run `rollback` to get a list of versions
3. Run `rollback VERSION_YOU_WANT_TO_ROLL_BACK_TO_HERE`

If you get a docker error double check the version you entered and consult Ryan.

NOTE: Any changes to master will deploy the latest version.

Also to you can run `rollback latest` to redeploy the latest version of the server.