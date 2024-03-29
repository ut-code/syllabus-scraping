const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const querystring = require("querystring");

const version = fs.readFileSync("version.json").toString();
const nendo = version.slice(0, 4);
const semester = version.slice(-1);

const data = [];

const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

const getDetailsUrl = (code, key, term) =>
  "https://utas.adm.u-tokyo.ac.jp/campusweb/campussquare.do?" +
  querystring.stringify({
    _flowExecutionKey: key,
    _eventId: "input",
    nendo: nendo,
    jikanwariShozokuCode: "00",
    gakkiKubunCode: term,
    jikanwaricd: code,
    locale: "ja_JP",
  });

const loadSearchPanelAndGetUrl = async (page) => {
  await page.goto(
    "https://utas.adm.u-tokyo.ac.jp/campusweb/campusportal.do?page=main&tabId=sy"
  );
  await wait(1000);
  const url = await page.$eval("iframe#main-frame-if", (iframe) => iframe.src);
  return url;
};

const loadSearchResult = async (page, url, gakkiKubunCode) => {
  await page.goto(url);
  await page.$eval("input#nendo", (input) => {
    input.value = nendo;
  });
  await wait(2000);
  await page.$eval("select#gakubuShozokuCode", (select) => {
    select.value = "00";
  });
  await wait(2000);
  await page.$eval("select#gakkiKubunCode", (select) => {
    select.value = gakkiKubunCode;
  }); // S1, S2, A1, A2 の順で 3 ~ 6
  await wait(2000);
  await page.$eval(
    "select[name=_displayCount] option[selected]",
    (option) => (option.value = "5000")
  );
  await wait(1000);
  await page
    .$x("//input[contains(@value, '検索')]")
    .then(([searchButton]) => searchButton.click());
};

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  console.log("Browser launched.");
  const page = await browser.newPage();
  console.log("New page opened.");

  await page.goto("https://utas.adm.u-tokyo.ac.jp/campusweb/campusportal.do");
  /* ここで手動でログイン処理を行う */
  await wait(60000);

  const url = await loadSearchPanelAndGetUrl(page);

  const basicInfos = [];
  const dataNums = [];
  const gakkiKubunCodes = semester === "S" ? [3, 4] : [5, 6];
  for (const gakkiKubunCode of gakkiKubunCodes) {
    await loadSearchResult(page, url, gakkiKubunCode);
    await wait(30000);
    const termBasicInfos = await page.$$eval("tbody tr", (rows) =>
      rows.map((row) => {
        const [
          ,
          semester,
          _periods,
          ,
          ,
          classroom,
          ,
          code,
          _type,
          category,
          titleJp,
          lecturerJp,
        ] = [...row.children].map((item) => item.innerText.trim());
        const periods = _periods
          .replace(/\s/, "")
          .split(",")
          .map((period) => period.trim());
        const type = _type.replace(/(.+)科目/, "$1");

        return {
          code,
          type,
          category,
          semester,
          periods,
          classroom,
          titleJp,
          lecturerJp,
        };
      })
    );
    basicInfos = basicInfos.concat(termBasicInfos);
    dataNums.push(termBasicInfos.length);
  }

  const numOfTerm1 = dataNums[0];

  console.log(basicInfos.length);

  let flowExecutionKey = await page.evaluate(
    () => location.href.match(/flowExecutionKey=(.+)$/)[1]
  );
  for (const [i, basicInfo] of basicInfos.entries()) {
    console.log(
      `Fetching ${basicInfo.code} - ${basicInfo.titleJp} (${i + 1} / ${
        basicInfos.length
      })`
    );
    await page.goto(
      getDetailsUrl(
        basicInfo.code,
        flowExecutionKey,
        gakkiKubunCodes[i < numOfTerm1 ? 0 : 1]
      )
    );
    await wait(2500);
    await page.$$eval(".ui-tabs-hide", (elements) => {
      elements.forEach((element) => {
        element.classList.remove("ui-tabs-hide");
      });
    });
    await wait(500);

    const addtionalInfo = await page.evaluate(() => {
      const table1 = document.querySelector(
        "#tabs-1 > .syllabus-normal > tbody"
      );
      const table2 = document.querySelector(
        "#tabs-2 > .syllabus-normal > tbody"
      );
      return {
        ccCode:
          table1
            ?.querySelector?.("tr:nth-child(3) > td")
            ?.innerText?.trim?.() ?? null,
        credits:
          table1
            ?.querySelector?.("tr:nth-child(9) > td")
            ?.innerText?.trim?.() ?? null,
        detail:
          table2
            ?.querySelector?.("tr:nth-child(2) > td")
            ?.innerText?.trim?.() ?? null,
        schedule:
          table2
            ?.querySelector?.("tr:nth-child(4) > td")
            ?.innerText?.trim?.() ?? null,
        methods:
          table2
            ?.querySelector?.("tr:nth-child(5) > td")
            ?.innerText?.trim?.() ?? null,
        evaluation:
          table2
            ?.querySelector?.("tr:nth-child(6) > td")
            ?.innerText?.trim?.() ?? null,
        notes:
          table2
            ?.querySelector?.("tr:nth-child(10) > td")
            ?.innerText?.trim?.() ?? null,
        class:
          table1
            ?.querySelector?.("tr:nth-child(13) > td")
            ?.innerText?.trim?.() ?? null,
      };
    });

    data.push({
      ...basicInfo,
      ...addtionalInfo,
    });

    if (i % 100 === 0) {
      fs.writeFileSync(`data${version}.json`, JSON.stringify(data));
    }

    if (i + 1 === numOfTerm1) {
      const url = await loadSearchPanelAndGetUrl(page);
      await loadSearchResult(page, url, gakkiKubunCodes[1]);
      await wait(10000);
      flowExecutionKey = await page.evaluate(
        () => location.href.match(/flowExecutionKey=(.+)$/)[1]
      );
    }

    if (i % 50 === 0) {
      const url = await loadSearchPanelAndGetUrl(page);
      await loadSearchResult(
        page,
        url,
        gakkiKubunCodes[i < numOfTerm1 ? 0 : 1]
      );
      await wait(10000);
      flowExecutionKey = await page.evaluate(
        () => location.href.match(/flowExecutionKey=(.+)$/)[1]
      );
    }
  }

  fs.writeFileSync(`data${version}.json`, JSON.stringify(data));
})();
