import http from "http";

/**
 * Send a request to a game server to see if it is ready
 * @param {} address 
 */
function ping(address) {
  return new Promise((resolve, reject) => {
    http.get(`http://${address}`, (res) => {
      if(res.statusCode !== 200) {
        reject(new Error("Invalid status code"));
        return;
      }

      resolve();
    }).on("error", reject);
  });
}

function sleep(ms) { 
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Send requests until the game server comes up
 * @param {string} address The address/path of the server
 * @param {number} count The number of times to try to connect
 */
export default async function poll(address, count = 50) {
  if(count === 0) {
    throw new Error("Failed to connect to server");
  }

  try {
    await ping(address);
  } catch(err) {
    // eslint-disable-next-line
    console.log(err.message);
    // The server is up but something is wrong
    if(err.message === "Invalid status code") {
      throw err;
    }

    await sleep(100);

    await poll(address, count - 1);
  }
}
