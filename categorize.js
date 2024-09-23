// 履修登録の枠と条件(進学選択, 前期課程修了)の判定ロジックを組み立てる場
// 「枠」: 履修登録の可否を決定するにあたって、互換性のある一群のうち、取得単位数の指定があって、それ以上分解できないもの

// TODO: UTAS -> その他 -> ダウンロードセンター から履修の手引き(電子版)がダウンロードできる ということをどこかに記載する

/** @typedef {Object.<string, number>} SubFrame */
/** @typedef {Object.<string, SubFrame>} Frame */
/**
 * @typedef PersonalFrame
 * @prop {Frame} general
 * @prop {Object.<string, Frame>} optional
 */

/**
 * @type {Frame}
 */
const completeCondition = {
  "既修外国語[英語]": {
    "英語一列①": 1, // PH
    "英語一列②": 1, // PH
    英語二列S: 1, // PH
    英語二列W: 2, // PH
    英語中級: 3, // PH, 移動可能
  },
  "既修外国語[日本語]": {
    "日本語一列①": 2,
    "日本語一列②": 2,
    日本語二列: 1,
    日本語中級: 3, // 移動可能
  },
  "既修外国語[ドイツ語,フランス語,中国語]": {
    "{}一列①": 2,
    "{}一列②": 2,
    "{}二列": 2,
    "{}中級": 2, // 移動可能
  },
  "既修外国語[ロシア語,スペイン語,韓国朝鮮語,イタリア語]": {
    "{}中級": 8, // 1S:4単位, 1A:2単位, 2単位移動可能
  },

  "初修外国語{既修}[英語]": {
    "英語一列①": 1, // PH
    "英語一列②": 1, // PH
    英語二列S: 1, // PH
    英語二列W: 2, // PH
  },
  "初修外国語{既修}[英語](文科)": {
    英語中級: 5, // 移動可能
  },
  "初修外国語{既修}[英語](理科)": {
    英語中級: 1, // 移動可能
  },
  "初修外国語{既修}[日本語,ドイツ語,フランス語,中国語]": {
    "{}一列①": 2,
    "{}一列②": 2,
    "{}二列": 2,
  },
  "初修外国語{既修}[日本語,ドイツ語,フランス語,中国語](文科)": {
    "{}中級": 4, // 移動可能
  },
  "初修外国語{既修}[ロシア語,スペイン語,韓国朝鮮語,イタリア語](理科)": {
    "{}中級": 6, // 1S:4単位, 1A:2単位, 2単位移動可能
  },
  "初修外国語{既修}[ロシア語,スペイン語,韓国朝鮮語,イタリア語](文科)": {
    "{}中級": 10, // 1S:4単位, 1A:2単位, 6単位移動可能
  },

  "初修外国語{初修}": {
    "{}一列①": 2,
    "{}一列②": 2,
    "{}二列": 2,
  },
  "初修外国語{初修}(文科)": {
    "{}初級(演習)①": 2,
    "{}初級(演習)②": 2,
  },

  情報: {
    情報: 2, // Adv
  },
  "身体運動・健康科学実習": {
    "身体運動・健康科学実習Ⅰ": 1, // DF
    "身体運動・健康科学実習Ⅱ": 1, // DF
  },
  初年次ゼミナール: {
    初年次ゼミナール: 2, // PH2
  },

  "基礎実験(理一)<物理学>": {
    "基礎実験Ⅰ(物理学)": 1, // Adv
    "基礎実験Ⅱ(物理学)": 1, // Adv
    "基礎実験Ⅲ(化学)": 1,
    "基礎実験Ⅳ(化学)": 0,
  },
  "基礎実験(理一)<化学>": {
    "基礎実験Ⅰ(化学)": 1, // Adv
    "基礎実験Ⅱ(化学)": 1, // Adv
    "基礎実験Ⅲ(物理学)": 1,
    "基礎実験Ⅳ(物理学)": 0,
  },
  "基礎実験(理一)<生命科学A>": {
    "基礎実験Ⅰ(物理学)": 1, // Adv
    "基礎実験Ⅱ(化学)": 1, // Adv
    基礎生命科学実験: 1, // Adv
    生命科学実験: 0, // Adv
  },
  "基礎実験(理一)<生命科学B>": {
    "基礎実験Ⅰ(化学)": 1, // Adv
    "基礎実験Ⅱ(物理学)": 1, // Adv
    基礎生命科学実験: 1, // Adv
    生命科学実験: 0, // Adv
  },
  "基礎実験(理二,理三)<A>": {
    "基礎物理学実験(A1)": 1,
    "基礎化学実験(A2)": 1,
    基礎生命科学実験: 1, // Adv
    生命科学実験: 0, // Adv
  },
  "基礎実験(理二,理三)<B>": {
    "基礎化学実験(A1)": 1,
    "基礎物理学実験(A2)": 1,
    基礎生命科学実験: 1, // Adv
    生命科学実験: 0, // Adv
  },

  "数理科学(理科)": {
    数理科学基礎: 2,
    "微分積分学①": 1,
    "微分積分学②": 2,
    "線型代数学①": 1,
    "線型代数学②": 2,
    微分積分学演習: 1,
    線型代数学演習: 1,
  },
  "数理科学(理一)": {
    数理科学基礎演習: 1,
    数学基礎理論演習: 1,
  },
  "数理科学(理二,理三)": {
    数理科学基礎演習: 0,
    数学基礎理論演習: 0,
  },

  "物質科学(理科)": {
    力学: 2, // DF
    電磁気学: 2, // DF
    熱力学: 2, // 一部(理一)DF
    構造化学: 2, // Adv
    物性化学: 2,
  },

  "生命科学(理一)": {
    生命科学: 1,
  },
  "生命科学(理二,理三)": {
    生命科学Ⅰ: 2,
    生命科学Ⅱ: 2,
  },

  // 以下、移動可能
  "社会科学(文一)<法>": {
    法: 4,
    政治: null,
  },
  "社会科学(文一)<政治>": {
    法: null,
    政治: 4,
  },
  "社会科学(文二)": {
    法: null,
    政治: null,
    "%sum{経済,数学}": 4,
  },
  "社会科学(文一,文二)": {
    経済: null,
    数学: null,
    社会: null,
    "%sum": 8,
  },
  "社会科学(文三)": {
    法: null,
    政治: null,
    経済: null,
    数学: null,
    社会: null,
    "%sum": 4,
    "%kind": 2,
  },

  "人文科学(文科)": {
    哲学: null,
    倫理: null,
    歴史: null,
    心理: null,
    ことばと文学: null,
    "%sum": 4,
    "%kind": 2,
  },

  展開科目: {
    "": 0,
  },
  主題科目: {
    "": 2,
  },

  総合科目: {
    A: null,
    B: null,
    C: null,
    D: null,
    E: null,
    F: null,
  },
  "総合科目(文一,文二)": {
    "%sum{A,B,C}": 6,
    "%sum{D,E,F}": 6,
  },
  "総合科目(文三)": {
    "%sum{L,A,B,C}": 10,
    "%sum{D,E,F}": 8,
  },
  "総合科目(文科)": {
    L: 2,
    "%kind{A,B,C}": 2,
    "%kind{D,E,F}": 2,
  },
  "総合科目(理科)": {
    L: null,
    "%sum{A,B,C,D}": 6,
    "%kind{A,B,C,D}": 2,
    "%sum{E,F}": 6,
    "%kind{E,F}": 2,
  },

  要求科目: {
    "": null,
  },
  // 実質要求科目: 別途検査(後回し)
  // 自由枠: 合計として検査
  // 合計: 別途検査
}; // 前期課程修了条件

// - 履修制限(一般)
//   1. 修得済
//   2. 同一科目同時期
//   3. 同一曜限
//   4. 対象クラス
// 履修学期の指定がある基礎科目は、すべてクラス指定があるため、上述の1と4の組み合わせにより、明示的に学期を指定する必要がない

// しかし、単位数制限ロジックが一律で"~単位以上"となっている現状、
// 同枠(排反)かつ科目名称が異なるもの(DF指定科目+α)については、科目名称の適切な読み替えが必要である
// (さもないと、例えば「力学A」と「力学B」の両方を受講できてしまう)
// - 科目名の読み替えが必要な科目一覧
//   1. 全般
//     1. (教員・教室未定) -> [削除]
//     2. α -> [削除]
//   2. 自然科学
//     1. 力学A, 力学B -> 力学
//     2. 電磁気学A, 電磁気学B -> 電磁気学
//     3. 熱力学, 化学熱力学 -> 熱力学
//   3. 英語中級, 英語上級
//     1. [末尾に追加] -> [[教員名]][[セメスター/ターム]]
//   4. (英語除く)外国語(初級, 中級, 上級), スポーツ・身体運動実習
//     1. [末尾に追加] -> [[開講年度][時間割コード]]

// - 履修制限(個別)
//   1. 英語中級, 英語上級
//     1. セメスター毎に指定クラス型, 全クラス型各1コマまで
//     2. 指定クラス型の削除は全クラス型履修時に限る
//   2. 社会科学, 人文科学
//     1. 同名同学期ⅠⅡ排反(人文科学「ことばと文学」除く)
//     2. 繰上は各2単位まで
//   3. スポーツ・身体運動実習(Ⅱ, PEAK含む)
//     1. セメスター毎に2コマ=2単位まで
//     2. 2S終了時までに2単位まで
//     3. 2A終了時までに4単位まで
//     4. 繰上(自由枠)は1単位まで
//     5. 繰上(総合D)は2単位まで
//   4. 第三外国語
//     1. 既修外国語, 初修外国語と同一言語は不可
//     2. セメスター毎に1言語につき1コマまで

/**
 *
 * @param {string} frameType
 * @param {string} frameCategory
 * @returns
 */
const isSemesterChangeable = (frameType, frameCategory) => {
  return (
    ["展開科目", "総合科目", "主題科目", "社会科学", "人文科学"].includes(
      frameType
    ) || frameCategory.includes("語中級")
  );
};

// 各講義のフレーム識別子は原則[大分類, 小分類]だが、一部は複数パターンへの対応のために読み替えが必要になる
// 以下、その一覧
// - 総合科目L系列: 既修外国語/初修外国語{既修}
//   - {}(中級/上級) ※第三外国語除く:
//     1. [既修外国語[{}], {}中級]
//     2. [初修外国語[既修{}], {}中級]
//     3. [総合科目, L]

/**
 * 講義情報からフレーム名を得る
 * @param {import("./process").Lecture} lecture
 * @returns {[string, string]}
 */
const getFrame = (lecture) => {
  switch (lecture.type) {
    case "主題":
    case "展開":
    case "要求":
      return [`${lecture.type}科目`, ""];
    case "総合":
      if (lecture.shortenedCategory === "L") {
        const lang = lecture.titleJp.match(
          /^(?<lang>(?!古典).+?語)[中上]級(?!\(第三外国語\))/
        ).groups?.lang;
        if (lang) {
          return [`既修外国語[${lang}]`, `${lang}中級`];
        }
      }
      return [`${lecture.type}科目`, lecture.shortenedCategory];
    case "基礎":
      if (lecture.shortenedCategory.includes("PEAK")) {
        return ["PEAK", ""];
      }
      switch (lecture.category) {
        case "基礎実験":
        case "数理科学":
        case "生命科学":
          return [lecture.category, lecture.titleJp];
        case "身体運動・健康科学実習":
          return [lecture.category, lecture.titleJp.slice(0, 12)];
        case "情報":
        case "初年次ゼミナール":
          return [lecture.category, lecture.category];
        case "物質科学":
          return [
            lecture.category,
            lecture.titleJp
              .replace("化学熱力学", "熱力学")
              .replace(/(?<=^(力学|電磁気学))[AB]/, ""),
          ];
        case "既修外国語":
          const lang = lecture.titleJp.match(
            /^(?<lang>.+?語)[一二]列(?:[SWCP①②])?/
          );
          if (lang) {
            return [`既修外国語[${lang}]`, `${lang}中級`];
          }
        case "初修外国語":
        case "社会科学":
        case "人文科学":
          throw new Error("WIP");
      }
    default:
      throw new Error(lecture);
  }
};

/**
 * 内部的に利用する講義名(講義名の一致/不一致が重複履修に該当するかと一致するような名前)を得る
 * @param {import("./process").Lecture} lecture
 */
const getVirtualName = (lecture) => {
  const name = lecture.titleJp.replace("α", "").replace("(教員・教室未定)", "");
  if (lecture.category === "物質科学") {
    return name
      .replace("化学熱力学", "熱力学")
      .replace(/(?<=^(力学|電磁気学))[AB]/, "");
  }
  if (name.startsWith("英語中級") || name.startsWith("英語上級")) {
    return `${name.slice(undefined, 4)}[${lecture.lecturerJp}][${
      name.includes("ターム") ? "ターム" : "セメスター"
    }]`;
  }
  if (
    name.startsWith("スポーツ・身体運動実習") ||
    name.match(/語[初中上]級(?!\(演習\)[①②])/)
  ) {
    const year = 2024; // TODO: 年度切り替え機能
    return `${name}[${year}][${lecture.code}]`;
  }
  return name;
};

/**
 * フレーム名を解析して、適用条件を返す
 * @param {string} frameType
 * @returns {{name: string, doubleLearned: string, lang: string, stream: string, option: string}}
 */
const frameTypeParser = (frameType) => {
  const pattern =
    /(?<name>[^{[(<]+)(?<doubleLearned>\{[初既]修\})?(?<lang>\[.+\])?(?<stream>\(.+\))?(?<option><.+>)?/;
  const parsed = frameType.match(pattern);
  if (!parsed) {
    throw new Error(frameType);
  }
  return parsed.groups;
};

/**
 * 一覧から適用条件が合致したフレームを返す
 * @param {string} streamJP
 * @param {string} firstFL
 * @param {string} secondFL
 * @param {boolean} isDoubleLearned
 * @returns {PersonalFrame}
 */
const getAppliedFrame = (streamJP, firstFL, secondFL, isDoubleLearned) => {
  /** @type {PersonalFrame} */
  const personalFrame = {
    general: {},
    optional: {},
  };
  for (const [frameType, subFrame] of Object.entries(completeCondition)) {
    const parsed = frameTypeParser(frameType);
    if (
      (!parsed.doubleLearned ||
        parsed.doubleLearned === (isDoubleLearned ? "{既修}" : "{初修}")) &&
      (!parsed.lang ||
        (parsed.name === "既修外国語" && parsed.lang.includes(firstFL)) ||
        (parsed.name === "初修外国語" && parsed.lang.includes(secondFL))) &&
      (!parsed.stream ||
        parsed.stream.includes(streamJP) ||
        parsed.stream.includes(`${streamJP[0]}科`))
    ) {
      /** @type {string} */
      let frameName;
      /** @type {SubFrame} */
      let appliedSubFrame;
      switch (parsed.name) {
        case "既修外国語":
          frameName = `既修外国語[${firstFL}]`;
          appliedSubFrame = Object.fromEntries(
            Object.entries(subFrame).map(([k, v]) => [
              k.replace("{}", firstFL),
              v,
            ])
          );
          break;
        case "初修外国語":
          frameName = `初修外国語[${isDoubleLearned ? "既修" : ""}${secondFL}]`;
          appliedSubFrame = Object.fromEntries(
            Object.entries(subFrame).map(([k, v]) => [
              k.replace("{}", secondFL),
              v,
            ])
          );
          break;
        default:
          frameName = parsed.name;
          appliedSubFrame = subFrame;
          break;
      }
      if (parsed.option) {
        personalFrame.optional[parsed.option.slice(1, -1)] = {
          [frameName]: appliedSubFrame,
        };
      } else {
        if (!personalFrame.general[frameName]) {
          personalFrame.general[frameName] = {};
        }
        Object.assign(personalFrame.general[frameName], appliedSubFrame);
      }
    }
  }
  return personalFrame;
};

console.log(getAppliedFrame("文一", "英語", "ドイツ語", false));

// 想定の履修が組まれていない際のメッセージパターン
// 1. 不正(<-必修): eg.必修が抜けている場合
// 2. 警告(<-推奨): eg.英語中級がクラス指定の曜限に入っていない場合, 社会科学(選択必修)がない場合 -> どう検知する?
// 3. 情報(<-提案): eg.デフォルト以外の選択肢(B(物質科学)やα)がある場合, 準必修がある場合

// では、「想定される必修」をどう定義するか?
// -> クラス指定科目 = 基礎科目+準必修、ただし以下を除く
// - 初修外国語{既修}[ロシア語,スペイン語,韓国朝鮮語,イタリア語]: {}語中級 -> 振替分は学期固定
// - 基礎実験: 基礎実験Ⅳ, 生命科学実験 -> 指定単位数が0
// - アドバンスト理科: 各科目 -> 非デフォルト選択肢
// - 社会科学: 数学除く全科目(文一,文二のみ必修該当あり)
// (人文科学, 総合科目は省略)

// -> required.jsで処理すれば良さそう
// Q. どのようなデータ形式にすべきか?
// A. デフォルトで履修するもの+変更可能な選択肢

// Q. 必修/推奨/提案の区別はどのようにつけるか?
// A. 以下に示す
// - 必修: 次を除く全ての基礎科目: 推奨リスト, 提案リスト, 社会科学, 人文科学
// - 推奨: {}語中級, 社会科学(文一:法or政治, 文二:経済+数学)
// - 提案: 物質科学Bコース(力学,電磁気学), 熱力学(化学熱力学), アドバンスト理科(情報,基礎実験,構造化学), 2S2基礎実験(基礎実験Ⅳ,生命科学実験), 準必修
// - 爾余: 社会科学(推奨リスト除く), 人文科学, 総合科目, 展開科目, 主題科目
// - 保留: 要求科目
