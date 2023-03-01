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
        console.log("Page moved.");

        const classInfos = await page.evaluate(() =>
            [...document.querySelectorAll(".catalog-search-result-table-row")].map(e => ({
                code: (e.children[0].children[0]) ? e.children[0].children[0].textContent.trim() : null,
                ccCode: (e.children[0].children[1]) ? e.children[0].children[1].textContent.trim() : null,
                titleJp: (e.children[1].childNodes[0]) ? e.children[1].childNodes[0].textContent.trim() : null,
                lecturerJp: (e.children[2].childNodes[0]) ? e.children[2].childNodes[0].textContent.trim() : null,
                semester: (e.children[3]) ? e.children[3].textContent.trim() : null,
                period: (e.children[4].childNodes[0]) ? e.children[4].childNodes[0].textContent.trim() : null
            }))
        );

        
    }

    
})();