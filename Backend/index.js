const express = require("express");

let app = express();

app.get("/", (r, re) => re.end("Hello world"));

app.listen(3000, "0.0.0.0");
