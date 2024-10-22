// スクレイピングにより授業データを取得

const puppeteer = require("puppeteer");
const fs = require("fs");
const querystring = require("querystring");

const version = JSON.parse(fs.readFileSync("version.json").toString());
const nendo = version.slice(0, 4);
const semester = version.slice(-1);
// S1, S2, A1, A2 の順で 3 ~ 6
const gakkiKubunCodes = semester === "S" ? [3, 4] : [5, 6];

const readFileName = `raw${version}.json`;
const writeFileName = `raw${version}.json`;

/** @type {Object<string, string>[]} */
let data = [];
/** @type {Set<string>} 完全な状態のデータの時間割コードのSet */
let skippableRecordCodes;

// 以下、スクレイピングが中断した状態からの回復用
try {
  data = JSON.parse(fs.readFileSync(readFileName));
  data = data
    .filter((record) => Object.values(record).every((v) => v !== null))
    .sort((a, b) => Number(a.code) - Number(b.code));
  skippableRecordCodes = new Set(data.map((record) => record["code"]));
} catch {
  skippableRecordCodes = new Set();
}

/**
 * 指定の時間だけ待機する
 * @param {number} time 単位はms
 */
const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

/**
 * 詳細のURLを取得する
 * @param {string} code
 * @param {string} key
 * @param {boolean} isFirstTerm
 * @returns {string}
 */
const getDetailsUrl = (code, key, isFirstTerm) =>
  "https://utas.adm.u-tokyo.ac.jp/campusweb/campussquare.do?" +
  querystring.stringify({
    _flowExecutionKey: key,
    _eventId: "input",
    nendo: nendo,
    jikanwariShozokuCode: "00",
    gakkiKubunCode: gakkiKubunCodes[isFirstTerm ? 0 : 1],
    jikanwaricd: code,
    locale: "ja_JP",
  });

/**
 * 検索条件入力ページに遷移し、urlとなる文字列を返す
 * @param {puppeteer.Page} page
 * @returns {Promise<string>} iframeのsrc
 */
const loadSearchPanelAndGetUrl = async (page) => {
  await page.goto(
    "https://utas.adm.u-tokyo.ac.jp/campusweb/campusportal.do?page=main&tabId=sy"
  );
  await wait(1000);
  const url = page.$eval("iframe#main-frame-if", (iframe) => iframe.src);
  return url;
};

/**
 * 検索結果ページに遷移する
 * @param {puppeteer.Page} page
 * @param {string} url iframeのurl
 * @param {boolean} isFirstTerm
 */
const loadSearchResult = async (page, url, isFirstTerm) => {
  await page.goto(url);
  await page.$eval(
    "input#nendo",
    (input, nendo) => {
      input.value = nendo;
    },
    nendo
  );
  await wait(2000);
  await page.$eval("select#gakubuShozokuCode", (select) => {
    select.value = "00";
  });
  await wait(2000);
  // S1, S2, A1, A2 の順で 3 ~ 6
  await page.$eval(
    "select#gakkiKubunCode",
    (select, gakkiKubunCode) => {
      select.value = gakkiKubunCode;
    },
    gakkiKubunCodes[isFirstTerm ? 0 : 1]
  );
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

// Ctrl-Cでプロセスを終了した場合には、以下のコードのfinally節が実行されないため、プロセス自体にハンドラを設定する
process.on("SIGINT", () => {
  fs.writeFileSync(writeFileName, JSON.stringify(data));
  console.log("\nScraping is aborted.");
});

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  console.log("Browser launched.");
  const page = await browser.newPage();
  console.log("New page opened.");

  await page.goto("https://utas.adm.u-tokyo.ac.jp/campusweb/campusportal.do");
  // ここで手動でログイン処理を行う
  await wait(60000);

  const url = await loadSearchPanelAndGetUrl(page);

  let basicInfos = [];
  const dataCounts = [];
  for (const isFirstTerm of [true, false]) {
    await loadSearchResult(page, url, isFirstTerm);
    await wait(30000);
    const termJpInfos = await page.$$eval("tbody tr", (rows) =>
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

    const localeChanger = await browser.newPage();
    await localeChanger.goto(
      "https://utas.adm.u-tokyo.ac.jp/campusweb/campusportal.do?page=main&tabId=home&locale=en_US"
    );
    await page.reload();
    await wait(5000);

    const termEnInfos = await page.$$eval("tbody tr", (rows) =>
      rows.map((row) => {
        const [, , , , , , , , , , titleEn, lecturerEn] = [...row.children].map(
          (item) => item.innerText.trim()
        );

        return {
          titleEn,
          lecturerEn,
        };
      })
    );

    await localeChanger.goto(
      "https://utas.adm.u-tokyo.ac.jp/campusweb/campusportal.do?page=main&tabId=home&locale=ja_JP"
    );
    await localeChanger.close();
    await wait(3000);

    const termBasicInfos = termJpInfos.map((jpInfo, i) => ({
      ...jpInfo,
      ...termEnInfos[i],
    }));

    basicInfos = basicInfos.concat(termBasicInfos);
    dataCounts.push(termBasicInfos.length);
  }

  const numOfTerm1 = dataCounts[0];
  console.log(basicInfos.length);

  let flowExecutionKey = await page.evaluate(
    () => location.href.match(/flowExecutionKey=(.+)$/)[1]
  );
  try {
    for (const [i, basicInfo] of basicInfos.entries()) {
      if (skippableRecordCodes.has(basicInfo.code)) {
        continue;
      }

      console.log(
        `Fetching ${basicInfo.code} - ${basicInfo.titleJp} (${i + 1} / ${
          basicInfos.length
        })`
      );
      await page.goto(
        getDetailsUrl(basicInfo.code, flowExecutionKey, i < numOfTerm1)
      );
      await wait(1500);
      await page.$$eval(".ui-tabs-hide", (elements) => {
        elements.forEach((element) => {
          element.classList.remove("ui-tabs-hide");
        });
      });
      await wait(500);

      const addtionalInfo = await page.evaluate(() => {
        /**
         * 講義情報の表から、指定の項目の情報を得る
         * @param {number} t
         * @param {number} n
         * @returns {string | null}
         */
        const getNthCellText = (t, n) => {
          const cell = document.querySelector(
            `#tabs-${t} > .syllabus-normal > tbody > tr:nth-child(${n}) > td`
          );
          return cell && cell.innerText.trim();
        };
        /**
         * 講義情報の表から、指定の項目の情報(ガイダンス関連)を得る
         * @param {number} n
         * @returns {string | null}
         */
        const getGuidance = (n) => {
          const cell = document.querySelector(
            `#tabs-2 > .syllabus-normal > tbody > tr:nth-child(9) > td tr:nth-child(${n}) > td`
          );
          return cell && cell.innerText.trim();
        };

        return {
          ccCode: getNthCellText(1, 3),
          credits: getNthCellText(1, 9),
          detail: getNthCellText(2, 2),
          schedule: getNthCellText(2, 4),
          methods: getNthCellText(2, 5),
          evaluation: getNthCellText(2, 6),
          notes: getNthCellText(2, 10),
          class: getNthCellText(1, 13),
          guidance: getGuidance(1),
          guidanceDate: getGuidance(2),
          guidancePeriod: getGuidance(3),
          guidancePlace: getGuidance(4),
          time: getNthCellText(2, 18),
          timeCompensation: getNthCellText(2, 19),
        };
      });

      data.push({
        ...basicInfo,
        ...addtionalInfo,
      });

      // この部分については、iframe周辺の処理用と推測している
      if (i === numOfTerm1 - 1 || i % 50 === 0) {
        const url = await loadSearchPanelAndGetUrl(page);
        await loadSearchResult(page, url, i < numOfTerm1 - 1);
        await wait(10000);
        flowExecutionKey = await page.evaluate(
          () => location.href.match(/flowExecutionKey=(.+)$/)[1]
        );
      }
    }

    console.log("Scraping is done.");
  } catch (e) {
    console.log("Scraping is suspended.");
    throw e;
  } finally {
    // スクレイピングがエラーで中断もしくは終了した時に保存する
    fs.writeFileSync(writeFileName, JSON.stringify(data));
  }

  page.close();
  browser.close();
})();
