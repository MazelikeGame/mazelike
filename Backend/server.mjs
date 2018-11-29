/* global ml */
import fs from "fs";
import http from "http";
import https from "https";

const PRIVKEY = process.env.KEY_FILE || "/data/certs/privkey.pem";
const CERT = process.env.CERT_FILE || "/data/certs/cert.pem";

let httpsOpts;

// Check if we have the key and cert
if(fs.existsSync(PRIVKEY) && fs.existsSync(CERT)) {
  httpsOpts = {
    key: fs.readFileSync(PRIVKEY),
    cert: fs.readFileSync(CERT)
  };

  // Redirect insecure requests
  http.createServer((req, res) => {
    res.writeHead(302, {
      Location: `https://${req.headers.host}${req.url}`
    });

    res.end("Redirecting to https");
  }).listen(3000, () => {
    ml.logger.info("Started https redirect server on port 3000");
  });
}

export let appPort = httpsOpts ? 3001 : 3000;

export function createServer(app) {
  if(httpsOpts) {
    // Force https
    if(app && app.use) {
      app.use((req, res, next) => {
        res.set("upgrade-insecure-requests", "1");
        next();
      });
    }

    return https.createServer(httpsOpts, app);
  }

  return http.createServer(app);
}