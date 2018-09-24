// var mysql = require('mysql');
// import mysql from "mysql";

// var con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "5757",
//   database: "test"
// });

// con.connect(function (err) {
//   if (err) throw err;
//   con.query("SELECT username FROM Account", function (err, result, fields) {
//     if (err) throw err;
//     user = result[0].username;
//     console.log(user)
//   });
// });

var user = "USERNAME HERE";
var myInfo = "{{username1}}";
var template = Handlebars.compile(myInfo);
var data = template({username1: user});
document.getElementById('username1').innerHTML = data;

var myUser = "{{username2}}";
var templateUser = Handlebars.compile(myUser);
var dataUser = templateUser({username2: user});
document.getElementById('username2').innerHTML = dataUser;

var email = "EMAIL@email.com HERE"
var myEmail = "{{emailHere}}";
var templateEmail = Handlebars.compile(myEmail);
var dataEmail = templateEmail({emailHere: email});
document.getElementById('email').innerHTML = dataEmail;
