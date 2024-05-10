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
 * @prop {number} credits ここで string -> number の変換を行う
 * @prop {string} detail
 * @prop {string} schedule
 * @prop {string} methods
 * @prop {string} evaluation
 * @prop {string} notes
 * @prop {string} class
 * @prop {string[]} one_grade
 * @prop {string[]} two_grade
 * @prop {[string[], string[]]} importance
 * @prop {string} guidance
 * @prop {string} guidanceDate
 * @prop {string} guidancePeriod
 * @prop {string} guidancePlace
 * @prop {string} shortenedCategory
 * @prop {string} shortenedEvaluation
 * @prop {string} shortenedClassroom
 * @prop {number} time ここで string -> number の変換を行う
 * @prop {string} timeCompensation
 * @prop {HTMLTableRowElement} tableRow
 */

// 文字列正規化
// 学年毎の対象クラス情報追加
// 使用するプロパティの追加
// 授業種別によってDBをソート

const fs = require("fs");

const version = JSON.parse(fs.readFileSync("version.json").toString());

/**
 * 全角英数字, 全角スペース, 空文字の除去、紛らわしい文字の統一、テンプレテキスト削除
 * 分かりにくいが、5つ目のreplaceの"～"は全角チルダであり、波ダッシュではない
 * 小文字にはしていない(検索時は別途toLowerCase()が必要)
 * 処理時点では、改行文字は"\n"で表されている
 * @param {string} text
 * @returns {string}
 */
const normalizeText = (text) =>
  text
    .replace(/\s+/g, " ") // 空白文字を半角スペースに統一
    .replace(/(?:\\n){3,}/g, "\\n\\n") // 連続する空行を1行に
    .replace(/[，．]/g, "$& ") // 全角コンマ, ピリオド(半角化される)の体裁を保つためにスペースを挿入
    .replace(/ (?=\\n)|(?<=\\n) /g, "") // 改行前後の空白を削除
    .replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)) // 半角化
    .replace(/[‐―−ｰ]/g, "-") // ハイフンに統合
    .replaceAll("〜", "~") // 波ダッシュ -> チルダ
    .replace(/"(特になし。?|TBA)"/g, '""')
    .replace(/【(?:各自)?入力不?可】|【各自ご入力ください\(必須\)】/g, "") // テンプレ文字列削除
    .replace(
      /https:\/\/(u-tokyo-ac-jp\.|us02web\.)?zoom.us\/.*?(?=\\n|[" ])/g,
      "【Zoom URLはポータル等にてご確認ください】"
    )
    .replace(
      /(ミーティング|Meeting) ID:? [\d ]{12,13}(\\n| )(パスコード|Passcode)(を設定する)?:? ?(\d{6}|.*?(?=\\n|[" ]))/g,
      "【Zoom URLはポータル等にてご確認ください】"
    )
    .replace(/(【Zoom URLはポータル等にてご確認ください】)(\\n| )*\1/g, "$1"); // ZoomURL削除

/**
 * 学年をパースして数字として返す。学年でない場合はnull
 * @param {string} text
 * @returns {number | null}
 */
const parseGrade = (text) => {
  return text[1] === "年" ? Number(text[0]) : null;
};

/**
 * 科類をパースして科類コードの一部もしくは全部を返す。科類でない場合はnull
 * @param {string} text
 * @returns {[boolean, string[]] | null} 第一要素はコードの全部(true)か一部(false)か, 第二要素はコードのリスト
 */
const parseStream = (text) => {
  const category = { 文: "l", 理: "s" }[text[0]];
  if (!category) {
    return null;
  }
  const codes = [];
  for (const num of text.slice(1)) {
    if (num === "科") {
      return [true, [1, 2, 3].map((i) => `${category}${i}_all`)];
    }
    const group = { 一: "1", 二: "2", 三: "3" }[num];
    if (group) {
      codes.push(`${category}${group}_`);
    } else {
      throw new Error(text);
    }
  }
  return [false, codes];
};

/**
 * 対象クラス情報をパースした結果を書き込む
 * @param {Lecture} e
 */
const parseClass = (e) => {
  console.log(e.code, e.titleJp, e.class);

  /** @type {string[]} */
  const temp = e.class
    .replaceAll("(", " | ")
    .replaceAll(")", " ! ")
    .replaceAll(",", " ")
    .trim()
    .split(" ");
  /** @type {number} */
  let grade = null;
  /** @type {[string[], string[]]} */
  const target = [[], []];

  for (let i = 0; i < temp.length; i++) {
    const grade_ = parseGrade(temp[i]);
    if (grade_) {
      grade = grade_;
      continue;
    }
    const stream_ = parseStream(temp[i]);
    if (stream_) {
      const [isEntire, codes] = stream_;
      if (isEntire) {
        target[grade - 1].push(...codes);
      } else {
        if (temp[i + 1] === "|") {
          i++;
          for (i++; temp[i] !== "!"; i++) {
            const classes = temp[i].split("-").map((n) => Number(n));
            switch (classes.length) {
              case 1:
                for (const code of codes) {
                  target[grade - 1].push(`${code}${classes[0]}`);
                }
                break;
              case 2:
                for (let j = classes[0]; j <= classes[1]; j++) {
                  for (const code of codes) {
                    target[grade - 1].push(`${code}${j}`);
                  }
                }
                break;
              default:
                throw new Error(`${i}: ${temp}`);
            }
          }
        } else {
          for (const code of codes) {
            target[grade - 1].push(`${code}all`);
          }
        }
      }
    }
  }
  target.forEach((l) => l.sort());
  e.one_grade = target[0];
  e.two_grade = target[1];
};

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

// TODO: ここの部分をドキュメントにしてページに載せる?
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
 * 授業の重要度を取得する
 * @param {string} text
 * @returns
 */
const getImportance = (text) => {
  // 必修(一意)
  const required = [
    /語[一二]列/,
    /語初級\(演習\)[①②]$/,
    /^情報$/,
    /^身体運動・健康科学実習/,
    /^初年次ゼミナール[文理]科$/,
    /^基礎実験[ⅠⅡⅢ]/,
    /^基礎(物理|化|生命科)学実験$/,
    /^数理科学基礎$/,
    /^(微分積分|線型代数)学(①|②|演習)$/,
    /^(力|電磁気)学A$/,
    /^熱力学$/,
    /^(構造|物性)化学$/,
    /^生命科学[ⅠⅡ]?$/,
  ];
  for (const regexp of required) {
    if (text.match(regexp)) {
      return [["l1", "l2", "l3", "s1", "s2", "s3"], []];
    }
  }

  // 必修(条件付き変更)
  const selection = [/^(力|電磁気)学B$/, /^化学熱力学$/, /α$/];
  for (const regexp of selection) {
    if (text.match(regexp)) {
      return [["l1", "l2", "l3", "s1", "s2", "s3"], []];
    }
  }

  // 必修(選択)
  const recommended = [
    /^英語[中上]級/,
    /^(法|政治|経済|社会|数学|哲学|倫理|歴史|心理)[ⅠⅡ]$/,
    /^ことばと文学/,
  ];
  for (const regexp of recommended) {
    if (text.match(regexp)) {
      return [[], ["l1", "l2", "l3", "s1", "s2", "s3"]];
    }
  }

  // 理一は必修、理二三は任意選択
  const conditional = [/^(数理科学基礎|数学基礎理論)演習$/];
  for (const regexp of conditional) {
    if (text.match(regexp)) {
      return [["s1"], ["s2", "s3"]];
    }
  }

  return [[], []];
};

/**
 * 講義情報を正規化, 追加する
 * @param {Lecture} lecture
 */
const processLecture = (lecture) => {
  lecture.credits = Number(lecture.credits);
  lecture.time = parseInt(lecture.time);

  lecture.detail = lecture.detail.trim();
  lecture.schedule = lecture.schedule.trim();
  lecture.methods = lecture.methods.trim();
  lecture.evaluation = lecture.evaluation.trim();
  lecture.notes = lecture.notes.trim();

  lecture.importance = getImportance(lecture.titleJp);
  lecture.guidance = getGuidance(lecture.guidance);
  lecture.shortenedCategory =
    lecture.type + getShortenedCategory(lecture.category);
  lecture.shortenedEvaluation = getShortenedEvaluation(lecture.evaluation);
  lecture.shortenedClassroom = getShortenedClassroom(lecture.classroom);
};

/**
 * DBをソートしたものを返す
 * @param {Lecture[]} data
 * @returns {Lecture[]}
 */
const getSortedDB = (data) => {
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
      integrated.get(e.shortenedCategory[2]).push(e);
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

  return sorted;
};

/**
 * versionからDBを読み込み、処理したものを書き出す
 * @param {string} version
 */
const processDB = (version) => {
  const readFileName = `raw${version}.json`;
  const writeFileName = `processed${version}.json`;

  const rawText = fs.readFileSync(readFileName).toString();

  // テキストを正規化する
  const normText = normalizeText(rawText);

  /** @type {Lecture[]} */
  const data = JSON.parse(normText);

  data.forEach(parseClass);

  data.forEach(processLecture);

  const sorted = getSortedDB(data);

  fs.writeFileSync(writeFileName, JSON.stringify(sorted));
};

processDB(version);
