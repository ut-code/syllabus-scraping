const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const querystring = require("querystring");

const version = fs.readFileSync("version.json").toString();

const data = [];

function wait(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  console.log("Browser launched.");
  const page = await browser.newPage();
  console.log("New page opened.");

  await page.goto("https://utas.adm.u-tokyo.ac.jp/campusweb/campusportal.do");
  await wait(30000);

  await page.goto(
    "https://utas.adm.u-tokyo.ac.jp/campusweb/campusportal.do?page=main&tabId=sy"
  );
  await wait(1000);
  const url = await page.$eval("iframe#main-frame-if", (iframe) => iframe.src);
  await page.goto(url);
  await page.$eval("input#nendo", (input) => {
    input.value = "2023";
  });
  await wait(2000);
  await page.$eval("select#gakubuShozokuCode", (select) => {
    select.value = "00";
  });
  await wait(2000);
  await page.$eval("select#gakkiKubunCode", (select) => {
    select.value = "5";
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
  await wait(30000);

  var basicInfos = await page.$$eval("tbody tr", (rows) =>
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

  const num_of_A1 = basicInfos.length;

  await page.goto(url);
  await page.$eval("input#nendo", (input) => {
    input.value = "2023";
  });
  await wait(2000);
  await page.$eval("select#gakubuShozokuCode", (select) => {
    select.value = "00";
  });
  await wait(2000);
  await page.$eval("select#gakkiKubunCode", (select) => {
    select.value = "6";
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
  await wait(30000);

  basicInfos = basicInfos.concat(
    await page.$$eval("tbody tr", (rows) =>
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
    )
  );

  console.log(basicInfos.length);

  var flowExecutionKey = await page.evaluate(
    () => location.href.match(/flowExecutionKey=(.+)$/)[1]
  );
  for (const [i, basicInfo] of basicInfos.entries()) {
    console.log(
      `Fetching ${basicInfo.code} - ${basicInfo.titleJp} (${i + 1} / ${
        basicInfos.length
      })`
    );
    await page.goto(
      getDetailsUrl(basicInfo.code, flowExecutionKey, i < num_of_A1 ? "5" : "6")
    );
    await wait(2500);
    await page.$$eval(".ui-tabs-hide", (elements) => {
      elements.forEach((element) => {
        element.classList.remove("ui-tabs-hide");
      });
    });
    await wait(500);

    const addtionalInfo = await page.evaluate(() => ({
      ccCode:
        document
          .querySelector(
            "#tabs-1 .syllabus-normal > tbody > tr:nth-child(3) td:nth-child(2)"
          )
          ?.innerText?.trim?.() ?? null,
      credits:
        document
          .querySelector(
            "#tabs-1 .syllabus-normal > tbody > tr:nth-child(9) td:nth-child(2)"
          )
          ?.innerText?.trim?.() ?? null,
      detail:
        document
          .querySelector(
            "#tabs-2 .syllabus-normal > tbody > tr:nth-child(2) td:nth-child(2)"
          )
          ?.innerText?.trim?.() ?? null,
      schedule:
        document
          .querySelector(
            "#tabs-2 .syllabus-normal > tbody > tr:nth-child(4) td:nth-child(2)"
          )
          ?.innerText?.trim?.() ?? null,
      methods:
        document
          .querySelector(
            "#tabs-2 .syllabus-normal > tbody > tr:nth-child(5) td:nth-child(2)"
          )
          ?.innerText?.trim?.() ?? null,
      evaluation:
        document
          .querySelector(
            "#tabs-2 .syllabus-normal > tbody > tr:nth-child(6) td:nth-child(2)"
          )
          ?.innerText?.trim?.() ?? null,
      notes:
        document
          .querySelector(
            "#tabs-2 .syllabus-normal > tbody > tr:nth-child(10) td:nth-child(2)"
          )
          ?.innerText?.trim?.() ?? null,
      class:
        document
          .querySelector(
            "#tabs-1 .syllabus-normal > tbody > tr:nth-child(13) td:nth-child(2)"
          )
          ?.innerText?.trim?.() ?? null,
    }));

    data.push({
      ...basicInfo,
      ...addtionalInfo,
    });

    if (i % 100 === 0) {
      fs.writeFileSync("data2023A.json", JSON.stringify(data));
    }

    if (i + 1 === num_of_A1) {
      await page.goto(
        "https://utas.adm.u-tokyo.ac.jp/campusweb/campusportal.do?page=main&tabId=sy"
      );
      await wait(1000);
      const url = await page.$eval(
        "iframe#main-frame-if",
        (iframe) => iframe.src
      );
      await page.goto(url);
      await page.$eval("input#nendo", (input) => {
        input.value = "2023";
      });
      await wait(2000);
      await page.$eval("select#gakubuShozokuCode", (select) => {
        select.value = "00";
      });
      await wait(2000);
      await page.$eval("select#gakkiKubunCode", (select) => {
        select.value = "6";
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
      await wait(10000);
      flowExecutionKey = await page.evaluate(
        () => location.href.match(/flowExecutionKey=(.+)$/)[1]
      );
    }

    if (i % 50 === 0) {
      await page.goto(
        "https://utas.adm.u-tokyo.ac.jp/campusweb/campusportal.do?page=main&tabId=sy"
      );
      await wait(1000);
      const url = await page.$eval(
        "iframe#main-frame-if",
        (iframe) => iframe.src
      );
      await page.goto(url);
      await page.$eval("input#nendo", (input) => {
        input.value = "2023";
      });
      await wait(2000);
      await page.$eval("select#gakubuShozokuCode", (select) => {
        select.value = "00";
      });
      await wait(2000);
      await page.$eval(
        "select#gakkiKubunCode",
        (select, i, num_of_A1) => {
          select.value = i < num_of_A1 ? "5" : "6";
        },
        i,
        num_of_A1
      ); // S1, S2, A1, A2 の順で 3 ~ 6
      await wait(2000);
      await page.$eval(
        "select[name=_displayCount] option[selected]",
        (option) => (option.value = "5000")
      );
      await wait(1000);
      await page
        .$x("//input[contains(@value, '検索')]")
        .then(([searchButton]) => searchButton.click());
      await wait(10000);
      flowExecutionKey = await page.evaluate(
        () => location.href.match(/flowExecutionKey=(.+)$/)[1]
      );
    }
  }

  fs.writeFileSync("data2023A.json", JSON.stringify(data));
})();

function getDetailsUrl(code, key, term) {
  return (
    "https://utas.adm.u-tokyo.ac.jp/campusweb/campussquare.do?" +
    querystring.stringify({
      _flowExecutionKey: key,
      _eventId: "input",
      nendo: version.slice(0, 4),
      jikanwariShozokuCode: "00",
      gakkiKubunCode: term,
      jikanwaricd: code,
      locale: "ja_JP",
    })
  );
}
