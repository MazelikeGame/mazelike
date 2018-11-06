const puppeteer = require("puppeteer");

const BASE_URL = process.env.IS_RUNNING_IN_DOCKER ? `http://${process.env.BACKEND}:3000` : "http://localhost:3000";

(async() => {
  let browser = await puppeteer.launch({
    executablePath: process.env.IS_RUNNING_IN_DOCKER ? "/usr/bin/chromium-browser" : undefined,
    args: process.env.IS_RUNNING_IN_DOCKER ? ["--no-sandbox"] : []
  });

  const test = async() => {
    try {
      let page = await browser.newPage();
      let failures = 0;
  
      await page.exposeFunction("__print__", (passed, message) => {
        if(!passed) {
          ++failures;
        }
  
        let status = passed ? " OK " : "FAIL";
        process.stdout.write(`[${status}]: ${message}\n`);
      });
  
      await page.exposeFunction("__close__", () => {
        browser.close()
          .then(() => {
            process.exit(failures > 0);
          });
      });
  
      await page.goto(`${BASE_URL}/game/test`);
    } catch(err) {
      test();
    }
  };

  test();
})();