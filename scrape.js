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
    const page = (await browser.pages())[0];
    await page.goto("https://utcode.net");
    const titles = await page.evaluate(() => {
        const elements= document.querySelectorAll(".entry-title");
        return Array.from(elements).map(element => element.textContent);
    });
    console.log(titles);
})();