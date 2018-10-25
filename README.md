# MazeLike

## Run the server

The first time you run this you should start with `docker-compose up mysql`.  You should see some logs fly across the screen when they stop type `CTRL^C`.

To start mysql and the backend run `docker-compose up`.

You can then navigate to http://localhost:3000/ in your browser.  For docker toolbox you will need to navigate to http://YOUR_DOCKER_IP_HERE:3000/.  You can get your docker machine ip by running `docker-machine ip` in the docker command prompt.

NOTE: You can run `docker-compose ps` to see if any containers are running and `docker-compose stop` to stop all containers.

## Testing

Run `npm test`

The server will need to be running in order to run the tests.

## MySQL auth errors

There may be data left over from a previous mysql instance run `docker-compose down` and `docker volume rm pp_3_mysql-data` to delete the old data. The try `docker-compose up --build` again.

## Generate documentation

Run `npm run doc`

## Migrations

* Run `npm run migration:create "name-of-migration-here"` to generate a skeleton migration
    * Documentation regarding the creation of migrations can be found here: https://sequelize.readthedocs.io/en/latest/docs/migrations/
* Run `npm run db:migrate` to migrate changes into the database
* Run `npm run db:migrate:undo` to undo previous migrations

## Manual deploy/rollback

1. Ssh into the server
2. Run `deploy` to get the list of available versions
3. Run `deploy VERSION_YOU_WANT_TO_ROLL_BACK_TO_HERE`

If you get a docker error double check the version you entered and consult Ryan.

NOTE: Any changes to master will deploy the latest version.

Also to you can run `deploy latest` to redeploy the latest version of the server.

## For mysql workbench

Connect to `localhost:5506` and login as root with the password password.

If mysql is not running run `docker-compose up -d mysql` to start it and `docker-compose down` to stop it.

## Default .env
```
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_DATABASE=mazelike
MAILER_EMAIL_ID=noreplymazelike@gmail.com
MAILER_PASSWORD=sneakybeakylike
MAILER_SERVICE_PROVIDER=Gmail
```
