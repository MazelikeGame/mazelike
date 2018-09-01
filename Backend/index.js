const express = require("express");
const net = require("net");

let app = express();

app.get("/", (r, re) => {
    net.connect(process.env.MYSQL_ADDRESS).on("error", err => {
        re.end(err && err.message);
    });
});

app.listen(3000, "0.0.0.0");
