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
2. Put the version you want in /etc/mazelike/VERSION
3. Restart the server with `sudo systemctl restart mazelike`

Also to you can run `deploy latest` to redeploy the latest version of the server.

# The DB variable
The db variable uses a uri to specify the database connection information.

For mysql the format is `mysql://username:password@host:port/database`.  If you exclude the port it is assumed to be 3306.

For sqlite it takes the form of sqlite://path/to/db.  For a relative path just use sqlite:// + the path.  For example sqlite://mazelike.sqlite refers to the file mazelike.sqlite in the current directory.  If you want to use an absolute path you can do that with 3 slashes (e.g. sqlite:///root/db = sqlite:// + /root/db).  On windows if the first path segment of an absolute path is a singe letter it is used as the drive letter.  So sqlite:///d/foo would refer to D:\foo (/ are substituted for \ automatically).  If the first segment is more than 1 letter it is assumed to be on the C drive.  Therefore sqlite://foo would refer to C:\foo.

## Default .env
```
DB=mysql://root:password@mysql/mazelike
MAILER_EMAIL_ID=noreplymazelike@gmail.com
MAILER_PASSWORD=sneakybeakylike
MAILER_SERVICE_PROVIDER=Gmail
```