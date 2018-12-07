const puppeteer = require("puppeteer");

const BASE_URL = "http://localhost:3000";

(async() => {
  let browser = await puppeteer.connect({
    browserWSEndpoint: "localhost:9222"
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