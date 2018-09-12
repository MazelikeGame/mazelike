import express from "express";
import {fsp} from "../promisified.mjs";

const packageJson = fsp.readFile("package.json", "utf8")
  .then(JSON.parse);

let versionRouter = express.Router();

/*
 * Remember all routes in this file are relative to /version
 * So in this file / is /version/ on the server
 */
versionRouter.get("/", async(req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Cache-Control": "no-cache",
  });

  res.end((await packageJson).version);
});

export default versionRouter;