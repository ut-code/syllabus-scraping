// 空白文字削除, 学年毎の対象クラス情報追加

const fs = require("fs");

const version = JSON.parse(fs.readFileSync("version.json").toString());

/**
 * 対象クラス情報をパースした結果を書き込む
 * @param {Lecture} e
 */
const parseClass = (e) => {
  console.log(e.code, e.titleJp, e.class);
  e.class_temp = e.class.split("(").join(" | ");
  e.class_temp = e.class_temp.split(")").join(" ! ");
  e.class_temp = e.class_temp.split(",").join(" ");
  e.class_temp = e.class_temp.split(" ");
  e.one_grade = [];
  e.two_grade = [];
  grade = 0;
  karui = {
    理一: "s1_",
    理二: "s2_",
    理三: "s3_",
    文一: "l1_",
    文二: "l2_",
    文三: "l3_",
  };
  for (let i = 0; i < e.class_temp.length; i++) {
    if (e.class_temp[i] === "1年") {
      grade = 1;
    } else if (e.class_temp[i] === "2年") {
      grade = 2;
    }
    if (grade === 1) {
      if (e.class_temp[i] === "理科") {
        e.one_grade.push("s1_all");
        e.one_grade.push("s2_all");
        e.one_grade.push("s3_all");
      } else if (e.class_temp[i] === "文科") {
        e.one_grade.push("l1_all");
        e.one_grade.push("l2_all");
        e.one_grade.push("l3_all");
      } else if (e.class_temp[i] === "理二三") {
        if (e.class_temp[i + 1] === "|") {
          for (let j = i + 2; e.class_temp[j] != "!"; j++) {
            classes = e.class_temp[j].split("-");
            if (classes.length === 2) {
              classes[0] = parseInt(classes[0]);
              classes[1] = parseInt(classes[1]);
              for (let k = classes[0]; k <= classes[1]; k++) {
                e.one_grade.push(karui["理二"] + String(k));
                e.one_grade.push(karui["理三"] + String(k));
              }
            } else if (classes.length === 1) {
              e.one_grade.push(karui["理二"] + classes[0]);
              e.one_grade.push(karui["理三"] + classes[0]);
            }
          }
        } else {
          e.one_grade.push(karui["理二"] + "all");
          e.one_grade.push(karui["理三"] + "all");
        }
      } else if (e.class_temp[i] === "文二三") {
        if (e.class_temp[i + 1] === "|") {
          for (let j = i + 2; e.class_temp[j] != "!"; j++) {
            classes = e.class_temp[j].split("-");
            if (classes.length === 2) {
              classes[0] = parseInt(classes[0]);
              classes[1] = parseInt(classes[1]);
              for (let k = classes[0]; k <= classes[1]; k++) {
                e.one_grade.push(karui["文二"] + String(k));
                e.one_grade.push(karui["文三"] + String(k));
              }
            } else if (classes.length === 1) {
              e.one_grade.push(karui["文二"] + classes[0]);
              e.one_grade.push(karui["文三"] + classes[0]);
            }
          }
        } else {
          e.one_grade.push(karui["文二"] + "all");
          e.one_grade.push(karui["文三"] + "all");
        }
      } else if (e.class_temp[i] === "文一二") {
        if (e.class_temp[i + 1] === "|") {
          for (let j = i + 2; e.class_temp[j] != "!"; j++) {
            classes = e.class_temp[j].split("-");
            if (classes.length === 2) {
              classes[0] = parseInt(classes[0]);
              classes[1] = parseInt(classes[1]);
              for (let k = classes[0]; k <= classes[1]; k++) {
                e.one_grade.push(karui["文一"] + String(k));
                e.one_grade.push(karui["文二"] + String(k));
              }
            } else if (classes.length === 1) {
              e.one_grade.push(karui["文一"] + classes[0]);
              e.one_grade.push(karui["文二"] + classes[0]);
            }
          }
        } else {
          e.one_grade.push(karui["文一"] + "all");
          e.one_grade.push(karui["文二"] + "all");
        }
      } else {
        for (let n = 0; n < 6; n++) {
          if (e.class_temp[i] === Object.keys(karui)[n]) {
            if (e.class_temp[i + 1] === "|") {
              for (let j = i + 2; e.class_temp[j] != "!"; j++) {
                classes = e.class_temp[j].split("-");
                if (classes.length === 2) {
                  classes[0] = parseInt(classes[0]);
                  classes[1] = parseInt(classes[1]);
                  for (let k = classes[0]; k <= classes[1]; k++) {
                    e.one_grade.push(karui[e.class_temp[i]] + String(k));
                  }
                } else if (classes.length === 1) {
                  e.one_grade.push(karui[e.class_temp[i]] + classes[0]);
                }
              }
            } else {
              e.one_grade.push(karui[e.class_temp[i]] + "all");
            }
          }
        }
      }
    } else if (grade === 2) {
      if (e.class_temp[i] === "理科") {
        e.two_grade.push("s1_all");
        e.two_grade.push("s2_all");
        e.two_grade.push("s3_all");
      } else if (e.class_temp[i] === "文科") {
        e.two_grade.push("l1_all");
        e.two_grade.push("l2_all");
        e.two_grade.push("l3_all");
      } else if (e.class_temp[i] === "理二三") {
        if (e.class_temp[i + 1] === "|") {
          for (let j = i + 2; e.class_temp[j] != "!"; j++) {
            classes = e.class_temp[j].split("-");
            if (classes.length === 2) {
              classes[0] = parseInt(classes[0]);
              classes[1] = parseInt(classes[1]);
              for (let k = classes[0]; k <= classes[1]; k++) {
                e.two_grade.push(karui["理二"] + String(k));
                e.two_grade.push(karui["理三"] + String(k));
              }
            } else if (classes.length == 1) {
              e.two_grade.push(karui["理二"] + classes[0]);
              e.two_grade.push(karui["理三"] + classes[0]);
            }
          }
        } else {
          e.two_grade.push(karui["理二"] + "all");
          e.two_grade.push(karui["理三"] + "all");
        }
      } else if (e.class_temp[i] === "文二三") {
        if (e.class_temp[i + 1] === "|") {
          for (let j = i + 2; e.class_temp[j] != "!"; j++) {
            classes = e.class_temp[j].split("-");
            if (classes.length === 2) {
              classes[0] = parseInt(classes[0]);
              classes[1] = parseInt(classes[1]);
              for (let k = classes[0]; k <= classes[1]; k++) {
                e.two_grade.push(karui["文二"] + String(k));
                e.two_grade.push(karui["文三"] + String(k));
              }
            } else if (classes.length === 1) {
              e.two_grade.push(karui["文二"] + classes[0]);
              e.two_grade.push(karui["文三"] + classes[0]);
            }
          }
        } else {
          e.two_grade.push(karui["文二"] + "all");
          e.two_grade.push(karui["文三"] + "all");
        }
      } else {
        for (let n = 0; n < 6; n++) {
          if (e.class_temp[i] === Object.keys(karui)[n]) {
            if (e.class_temp[i + 1] === "|") {
              for (let j = i + 2; e.class_temp[j] != "!"; j++) {
                classes = e.class_temp[j].split("-");
                if (classes.length === 2) {
                  classes[0] = parseInt(classes[0]);
                  classes[1] = parseInt(classes[1]);
                  for (let k = classes[0]; k <= classes[1]; k++) {
                    e.two_grade.push(karui[e.class_temp[i]] + String(k));
                  }
                } else if (classes.length === 1) {
                  e.two_grade.push(karui[e.class_temp[i]] + classes[0]);
                }
              }
            } else {
              e.two_grade.push(karui[e.class_temp[i]] + "all");
            }
          }
        }
      }
    }
  }
  delete e.class_temp;
};

const beautifyDB = (version) => {
  const readFileName = `raw${version}.json`;
  const writeFileName = `beautified${version}.json`;

  let rawData = fs.readFileSync(readFileName).toString();
  rawData = rawData.replace(/\s+/g, " ").replace(/\\n\s/g, "");

  /** @type {Lecture[]} */
  const data = JSON.parse(rawData);

  data.forEach(parseClass);

  fs.writeFileSync(writeFileName, JSON.stringify(data));
};

beautifyDB(version);
