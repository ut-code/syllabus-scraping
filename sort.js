// 授業種別によってDBをソート
// TODO: process.jsの後に実行するように改修

const fs = require("fs");

const version = JSON.parse(fs.readFileSync("version.json").toString());

const sortDB = (version) => {
  const readFileName = `beautified${version}.json`;
  const writeFileName = `sorted${version}.json`;

  const rawData = fs.readFileSync(readFileName).toString();

  const data = JSON.parse(rawData);

  /** @type {Map<string, Lecture[]>} */
  const nonIntegrated = new Map([
    ["基礎", []],
    ["主題", []],
    ["要求", []],
    ["展開", []],
    ["PEAK", []],
    ["JP", []],
  ]);
  /** @type {Map<string, Lecture[]>} */
  const integrated = new Map([
    ["A", []],
    ["B", []],
    ["C", []],
    ["D", []],
    ["E", []],
    ["F", []],
    ["L", []],
  ]);

  data.forEach((e) => {
    if (e.titleJp.includes("PEAK")) {
      nonIntegrated.get("PEAK").push(e);
    } else if (e.titleJp.includes("日本語") && e.titleJp.includes("級")) {
      nonIntegrated.get("JP").push(e);
    } else if (nonIntegrated.has(e.type)) {
      nonIntegrated.get(e.type).push(e);
    } else if (e.type === "総合" && integrated.has(e.shortenedCategory[2])) {
      integrated.get("JP").push(e);
    } else {
      console.log(e.type, e.shortenedCategory, e.titleJp);
    }
  });

  console.log("総合");
  integrated.forEach((v, k) => {
    console.log(`${k}: ${v.length}`);
  });
  console.log("");
  nonIntegrated.forEach((v, k) => {
    console.log(`${k}: ${v.length}`);
  });

  const foundation = nonIntegrated.get("基礎");
  nonIntegrated.delete("基礎");

  const sorted = foundation.concat(
    ...integrated.values(),
    ...nonIntegrated.values()
  );

  console.log(sorted.length);

  fs.writeFileSync(writeFileName, JSON.stringify(sorted));
};

sortDB(version);
