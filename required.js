// クラス毎の必修授業の時間割コードのリストを提供する

const fs = require("fs");

const version = JSON.parse(fs.readFileSync("version.json").toString());

const getRequiredDB = (version) => {
  const readFileName = `processed${version}.json`;
  const writeFileName = `required${version}.json`;

  const rawData = fs.readFileSync(readFileName).toString();

  const data = JSON.parse(rawData);
  /** @type {Object.<string, string[]>[]} */
  const required = [{}, {}];
  /** @type {Object.<string, string[]>[]} */
  const subjectName = [{}, {}];
  /** @type {string[]} */
  const inited = [];
  const init = (className) => {
    if (!inited.includes(className)) {
      inited.push(className);
      required[0][className] = [];
      required[1][className] = [];
      subjectName[0][className] = [];
      subjectName[1][className] = [];
    }
  };

  data.forEach((e) => {
    for (let i = 1; i <= 39; i++) {
      const className_s1 = "s1_" + i;
      init(className_s1);
      for (let i = 0; i < e.targetClass[0].length; i++) {
        if (className_s1 === e.targetClass[0][i]) {
          if (
            !(
              e.titleJp === "図形科学A" ||
              e.titleJp === "基礎化学" ||
              e.titleJp === "基礎統計"
            )
          ) {
            required[0][className_s1].push(e.code);
            subjectName[0][className_s1].push(e.titleJp);
          }
        }
      }
      for (let i = 0; i < e.targetClass[1].length; i++) {
        if (className_s1 === e.targetClass[1][i]) {
          if (
            !(
              e.titleJp === "図形科学B" ||
              e.titleJp === "図形科学A" ||
              e.titleJp === "基礎統計" ||
              e.titleJp === "常微分方程式" ||
              e.titleJp === "有機反応化学"
            )
          ) {
            required[1][className_s1].push(e.code);
            subjectName[1][className_s1].push(e.titleJp);
          }
        }
      }
    }
    for (let i = 1; i <= 24; i++) {
      const className_s2 = "s2_" + i;
      init(className_s2);
      for (let i = 0; i < e.targetClass[0].length; i++) {
        if (className_s2 === e.targetClass[0][i]) {
          if (
            !(
              e.titleJp === "図形科学A" ||
              e.titleJp === "基礎化学" ||
              e.titleJp === "基礎統計" ||
              e.titleJp === "数理科学基礎演習" ||
              e.titleJp === "数学基礎理論演習"
            )
          ) {
            required[0][className_s2].push(e.code);
            subjectName[0][className_s2].push(e.titleJp);
          }
        }
      }
      for (let i = 0; i < e.targetClass[1].length; i++) {
        if (className_s2 === e.targetClass[1][i]) {
          if (
            !(
              e.titleJp === "図形科学B" ||
              e.titleJp === "図形科学A" ||
              e.titleJp === "基礎統計" ||
              e.titleJp === "常微分方程式" ||
              e.titleJp === "有機反応化学"
            )
          ) {
            required[1][className_s2].push(e.code);
            subjectName[1][className_s2].push(e.titleJp);
          }
        }
      }
    }
    for (let i = 1; i <= 24; i++) {
      const className_s3 = "s3_" + i;
      init(className_s3);
      for (let i = 0; i < e.targetClass[0].length; i++) {
        if (className_s3 === e.targetClass[0][i]) {
          if (
            !(
              e.titleJp === "図形科学A" ||
              e.titleJp === "基礎化学" ||
              e.titleJp === "基礎統計" ||
              e.titleJp === "数理科学基礎演習" ||
              e.titleJp === "数学基礎理論演習"
            )
          ) {
            required[0][className_s3].push(e.code);
            subjectName[0][className_s3].push(e.titleJp);
          }
        }
      }
      for (let i = 0; i < e.targetClass[1].length; i++) {
        if (className_s3 === e.targetClass[1][i]) {
          if (
            !(
              e.titleJp === "図形科学B" ||
              e.titleJp === "図形科学A" ||
              e.titleJp === "基礎統計" ||
              e.titleJp === "常微分方程式" ||
              e.titleJp === "有機反応化学"
            )
          ) {
            required[1][className_s3].push(e.code);
            subjectName[1][className_s3].push(e.titleJp);
          }
        }
      }
    }
    for (let i = 1; i <= 39; i++) {
      const className_l1 = "l1_" + i;
      init(className_l1);
      if (
        e.titleJp === "法Ⅰ" ||
        e.titleJp === "政治Ⅰ" ||
        e.titleJp === "法Ⅱ" ||
        e.titleJp === "政治Ⅱ"
      ) {
        required[0][className_l1].push(e.code);
        subjectName[0][className_l1].push(e.titleJp);
      }
      for (let i = 0; i < e.targetClass[0].length; i++) {
        if (className_l1 === e.targetClass[0][i]) {
          if (!(e.titleJp === "基礎化学" || e.titleJp === "基礎統計")) {
            required[0][className_l1].push(e.code);
            subjectName[0][className_l1].push(e.titleJp);
          }
        }
      }
    }
    for (let i = 1; i <= 39; i++) {
      const className_l2 = "l2_" + i;
      init(className_l2);
      if (
        e.titleJp === "数学Ⅰ" ||
        e.titleJp === "経済Ⅰ" ||
        e.titleJp === "数学Ⅱ" ||
        e.titleJp === "経済Ⅱ"
      ) {
        required[0][className_l2].push(e.code);
        subjectName[0][className_l2].push(e.titleJp);
      }
      for (let i = 0; i < e.targetClass[0].length; i++) {
        if (className_l2 === e.targetClass[0][i]) {
          if (!(e.titleJp === "基礎化学" || e.titleJp === "基礎統計")) {
            required[0][className_l2].push(e.code);
            subjectName[0][className_l2].push(e.titleJp);
          }
        }
      }
    }
    for (let i = 1; i <= 20; i++) {
      const className_l3 = "l3_" + i;
      init(className_l3);
      for (let i = 0; i < e.targetClass[0].length; i++) {
        if (className_l3 === e.targetClass[0][i]) {
          if (!(e.titleJp === "基礎化学" || e.titleJp === "基礎統計")) {
            required[0][className_l3].push(e.code);
            subjectName[0][className_l3].push(e.titleJp);
          }
        }
      }
    }
  });

  fs.writeFileSync(writeFileName, JSON.stringify(required));
  console.log(subjectName);
};

getRequiredDB(version);
