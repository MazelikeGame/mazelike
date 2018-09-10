var http = require('http');
var uc = require('upper-case'); // npm package
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(uc("Hello World!")); //package usage ex
    res.end();
}).listen(8080);