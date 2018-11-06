# MazeLike

## Testing

Run `npm test` in the tests directory.  You will also have to run npm install in the tests directory.  
If you don't want to download chrome for the browser tests define `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1` (powershell `$env:PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1`)

The server will need to be running in order to run the tests.

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
