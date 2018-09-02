# MazeLike

**TA disclaimer: All of the code in Backend and Frontend as well as the nodejs config files (like package.json) were written by Jake.**

## Docker instructions

### Run the server

The first time you run this you should start with `docker-compose up mysql`.  You should see some logs fly across the screen when they stop type `CTRL^C`.

To start mysql and the backend run `docker-compose up`.

You can then navigate to http://localhost:3000/ in your browser.  For docker toolbox you will need to navigate to http://YOUR_DOCKER_IP_HERE:3000/.  You can get your docker machine ip by running `docker-machine ip` in the docker command prompt.

### Testing

Use the nodejs testing method.

## Local instructions (requires nodejs and mysql)

To install all dependencies run `npm install`.

### Starting the application
* Run `npm start`
* View in-browser at localhost:3000

### Testing
* To check for lint errors run `npm run eslint`.
    * To automatically fix eslint errors run `npm run eslint --fix`

This is based on node v8.11 but it would work on 10 as well.
