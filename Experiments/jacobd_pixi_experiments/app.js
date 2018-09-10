const express = require('express');
const path = require('path');
const app = express();

/**
 * Simple web server to serve the game files.
 */

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendFile('index.html');
});

app.listen(3000, function () {
  console.log('Hosting on http://localhost:3000');
});
