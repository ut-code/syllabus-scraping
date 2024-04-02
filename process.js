// 使用するプロパティの追加, 文字列正規化

const fs = require("fs");

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
 * @prop {string | number} credits
 * @prop {string} detail
 * @prop {string} schedule
 * @prop {string} methods
 * @prop {string} evaluation
 * @prop {string} notes
 * @prop {string} class
 * @prop {string[]} one_grade
 * @prop {string[]} two_grade
 * @prop {string} guidance
 * @prop {string} guidanceDate
 * @prop {string} guidancePeriod
 * @prop {string} guidancePlace
 * @prop {string} shortenedCategory
 * @prop {string} shortenedEvaluation
 * @prop {string} shortenedClassroom
 * @prop {HTMLTableRowElement} tableRow
 */

const version = JSON.parse(fs.readFileSync("version.json").toString());

/**
 * 全角英数字, 全角スペース, 空文字の除去、紛らわしい文字の統一、テンプレテキスト削除
 * 分かりにくいが、3つ目のreplaceの"～"は全角チルダであり、波ダッシュではない
 * 小文字にはしていない(検索時は別途toLowerCase()が必要)
 * @param {string} text
 * @returns {string}
 */
const normalize = (text) =>
  text
    .replace(/([^\S\n]|　)+/g, " ")
    .replace(/[，．]/g, "$& ")
    .replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[‐―−ｰ]/g, "-")
    .replaceAll("〜", "~")
    .replace(/【(?:各自)?入力不?可】|【各自ご入力ください\(必須\)】/g, "");

/**
 * 系列の短縮表現を得る
 * @param {string} category
 */
const getShortenedCategory = (category) => {
  switch (category) {
    case "L(言語・コミュニケーション)":
      return "L";
    case "A(思想・芸術)":
      return "A";
    case "B(国際・地域)":
      return "B";
    case "C(社会・制度)":
      return "C";
    case "D(人間・環境)":
      return "D";
    case "E(物質・生命)":
      return "E";
    case "F(数理・情報)":
      return "F";
    default:
      return "";
  }
};

/**
 * 評価方法の短縮表現を得る
 * @param {string} text
 */
const getShortenedEvaluation = (text) => {
  if (!text) {
    return "不明";
  }
  return [
    /試験|(?:期末|中間)テスト|[Ee]xam/.test(text) ? "試験" : "",
    /レポート|提出|課題|宿題|[Aa]ssignments|[Rr]eport|[Hh]omework|[Pp]aper/.test(
      text
    )
      ? "レポ"
      : "",
    /出席|出欠|[Aa]ttendance|参加|[Pp]articipation/.test(text) ? "出席" : "",
    /平常点|小テスト|参加|[Pp]articipation/.test(text) ? "平常" : "",
  ].join("");
};

/**
 * 講義場所の短縮表現を得る
 * 1. 大半の表示は、"(1~2桁の建物番号)**"
 * 2. ただし、8号館及び10号館は、"(建物番号)-***"
 * 3. また、"900" -> 講堂
 * 4. "E**" -> 情報教育棟
 * 5. "(East/West) K***" -> 21KOMCEE
 * 6. "KALS" = 17号館2階
 * 7. "アドミニ棟" = アドミニストレーション棟
 * 8. "コミプラ" = コミュニケーションプラザ
 * @param {string} text
 * @returns {string}
 */
// TODO: ここの部分をドキュメントにしてページに載せる?
const getShortenedClassroom = (text) => {
  if (!text) {
    return "不明";
  }
  if (text.includes(", ")) {
    return text.split(", ").map(getShortenedClassroom).join(", ");
  }
  const classroom = text.match(
    /^(?:駒場\d+号館|情報教育棟) (E?[-\d]+|18号館.+)(?:教室)?$/
  )?.[1];
  if (classroom) {
    return classroom === "900" ? "講堂" : classroom;
  }
  const komcee = text.match(/^21KOMCEE ((?:East|West) K\d+)$/)?.[1];
  if (komcee) {
    return komcee;
  }
  const other = text.match(/^その(他\(学[内外]等\))/)?.[1];
  if (other) {
    return other;
  }
  if (text.includes("KALS")) {
    return "KALS";
  }
  if (text.includes("コミュニケーションプラザ")) {
    return text.replace("コミュニケーションプラザ", "コミプラ");
  }
  if (text.includes("アドミニストレーション棟")) {
    return text.replace("アドミニストレーション棟", "アドミニ棟");
  }
  return text;
};

/**
 * ガイダンスの表記を短縮する
 * @param {string} text
 */
const getGuidance = (text) => {
  switch (text) {
    case "第一回授業日に行う。/Will conduct guidance at first time":
      return "初回";
    case "特定日に行う。/Will conduct guidance at another time":
      return "別日";
    case "特に行わない。/Will not conduct guidance":
      return "なし";
    default:
      return text ?? "";
  }
};

/**
 * 講義情報を正規化, 追加する
 * @param {Lecture} lecture
 */
const processLecture = (lecture) => {
  lecture.credits = Number(lecture.credits);

  lecture.detail = lecture.detail.trim();
  lecture.schedule = lecture.schedule.trim();
  lecture.methods = lecture.methods.trim();
  lecture.evaluation = lecture.evaluation.trim();
  lecture.notes = lecture.notes.trim();

  lecture.guidance = getGuidance(lecture.guidance);
  lecture.shortenedCategory =
    lecture.type + getShortenedCategory(lecture.category);
  lecture.shortenedEvaluation = getShortenedEvaluation(lecture.evaluation);
  lecture.shortenedClassroom = getShortenedClassroom(lecture.classroom);
};

const processDB = (version) => {
  const readFileName = `sorted${version}.json`;
  const writeFileName = `processed${version}.json`;

  let rawData = fs.readFileSync(readFileName).toString();

  rawData = normalize(rawData);

  /** @type {Lecture[]} */
  const data = JSON.parse(rawData);

  // テキストを正規化する
  for (const lecture of data) {
    processLecture(lecture);
  }

  fs.writeFileSync(writeFileName, JSON.stringify(data));
};

processDB(version);
