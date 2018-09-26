// var mysql = require('mysql');
// import mysql from "mysql";

// var con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "5757",
//   database: "test"
// });

// var user = "USERNAME HERE";

// // con.connect(function (err) {
// //   if (err) throw err;
// //   con.query("SELECT username FROM Account", function (err, result, fields) {
// //     if (err) throw err;
// //     user = result[0].username;
// //     console.log(user)
// //   });
// // });

// var myInfo = "{{username}}";
// //var template = Handlebars.compile(myInfo);
// var data = template({username: user});
// document.getElementById('username').innerHTML = data;