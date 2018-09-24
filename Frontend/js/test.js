var mysql = require('mysql')

//import mysql from "mysql";

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "5757",
  database: "test"
});

var usr = "";

con.connect(function (err) {
  if (err) throw err;
  con.query("SELECT username FROM Account", function (err, result, fields) {
    if (err) throw err;
    usr = result[0].username;
    console.log(usr)
  });
});

console.log(usr)
var myInfo = "{{username}}";
var template = Handlebars.compile(myInfo);
var data = template({username: user});
document.getElementById('username').innerHTML = data;
