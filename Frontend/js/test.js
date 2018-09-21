var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "5757",
  database: "test"
});

con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT username FROM Account", function (err, result, fields) {
      if (err) throw err;
      console.log(result[0].username);
    });
});
