const puppeteer = require("puppeteer");

function wait(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

(async () => {
    const data = [];
    const browser = await puppeteer.launch({ headless: false });
    console.log("Browser launched.")
    const page = await browser.newPage();
    console.log("New page opened.");

    for (let i = 1; i <= 180; i++) {
        await page.goto(`https://catalog.he.u-tokyo.ac.jp/result?q=&type=jd&faculty_id=&facet=%7B%7D&page=${i}`)
        console.log("Page moved.")
    }
})();