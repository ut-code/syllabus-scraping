// クラス毎の必修授業の時間割コードのリストを提供する

/** @typedef {string} Code */
/** @typedef {string} Semester */
/** @typedef {string} Period */
/** @typedef {string} TitleJp */
/**
 * @typedef {Object} Lecture
 * @prop {Code} code
 * @prop {string} type
 * @prop {string} category
 * @prop {Semester} semester
 * @prop {Period[]} periods
 * @prop {string} classroom
 * @prop {TitleJp} titleJp
 * @prop {string} titleEn
 * @prop {string} lecturerJp
 * @prop {string} lecturerEn
 * @prop {string} ccCode
 * @prop {number} credits
 * @prop {string} detail
 * @prop {string} schedule
 * @prop {string} methods
 * @prop {string} evaluation
 * @prop {string} notes
 * @prop {string} class
 * @prop {[string[], string[]]} importance
 * @prop {[string[], string[]]} targetClass
 * @prop {string} guidance
 * @prop {string} guidanceDate
 * @prop {string} guidancePeriod
 * @prop {string} guidancePlace
 * @prop {string} shortenedCategory
 * @prop {string} shortenedEvaluation
 * @prop {string} shortenedClassroom
 * @prop {number} time
 * @prop {string} timeCompensation
 * @prop {HTMLTableRowElement} tableRow
 */

const fs = require("fs");

const version = JSON.parse(fs.readFileSync("version.json").toString());

const getRequiredDB = (version) => {
  const readFileName = `processed${version}.json`;
  const writeFileName = `required${version}.json`;
  const logFileName = `requiredTitle${version}.json`;

  const rawData = fs.readFileSync(readFileName).toString();

  /** @type {Lecture[]} */
  const data = JSON.parse(rawData);
  /** @type {Object.<string, string[]>[]} */
  const required = [{}, {}];
  /** @type {Object.<string, string[]>[]} */
  const requiredTitle = [{}, {}];
  /** @type {string[]} */
  const inited = [];
  const init = (className) => {
    if (!inited.includes(className)) {
      inited.push(className);
      required[0][className] = [];
      required[1][className] = [];
      requiredTitle[0][className] = [];
      requiredTitle[1][className] = [];
    }
  };

  data.forEach((e) => {
    // 文科
    const regexpL = [/^(?:法|政治)[ⅠⅡ]$/, /^(?:数学|経済)[ⅠⅡ]$/, /(?!)/];
    for (let group = 1; group <= 3; group++) {
      const classNum = group === 3 ? 20 : 39;
      for (let i = 1; i <= classNum; i++) {
        const className = `l${group}_${i}`;
        init(className);
        if (
          e.category === "社会科学"
            ? e.titleJp.match(regexpL[group - 1])
            : e.targetClass[0].includes(className) &&
              (e.type !== "総合" || e.shortenedCategory === "総合L")
        ) {
          required[0][className].push(e.code);
          requiredTitle[0][className].push(e.titleJp);
        }
      }
    }
    // 理科
    for (let group = 1; group <= 3; group++) {
      const classNum = group === 1 ? 39 : 24;
      for (let i = 1; i <= classNum; i++) {
        const className = `s${group}_${i}`;
        init(className);
        for (let grade = 1; grade <= 2; grade++) {
          if (
            e.targetClass[grade - 1].includes(className) &&
            (e.type !== "総合" || e.shortenedCategory === "総合L")
          ) {
            required[grade - 1][className].push(e.code);
            requiredTitle[grade - 1][className].push(e.titleJp);
          }
        }
      }
    }
  });

  fs.writeFileSync(writeFileName, JSON.stringify(required));
  fs.writeFileSync(logFileName, JSON.stringify(requiredTitle));
};

getRequiredDB(version);
