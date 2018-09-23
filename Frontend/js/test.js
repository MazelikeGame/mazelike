//var mysql = require('mysql');
import mysql from "mysql";

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "5757",
  database: "test"
});

function getUsername(){
return "lol";
}

con.connect(function (err) {
  if (err) throw err;
  con.query("SELECT username FROM Account", function (err, result, fields) {
    if (err) throw err;
    console.log(result[0].username);
  });
});
