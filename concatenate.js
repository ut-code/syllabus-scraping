// 当該セメスターと1つ前のセメスターのデータを結合し、直近1年分の講義が含まれるDBを構築する

const fs = require("fs");

const version = JSON.parse(fs.readFileSync("version.json").toString());

const loadDB = (version) => {
  const readFileName = `processed${version}.json`;
  const rawData = fs.readFileSync(readFileName).toString();
  const data = JSON.parse(rawData);
  return data;
};

const concatenateDB = (version) => {
  const nendo = version.slice(0, 4);
  const semester = version.slice(-1);
  const formerVersion = semester === "S" ? `${nendo - 1}A` : `${nendo}S`;

  const writeFileName = `concatenated${version}.json`;

  const data = [].concat(...[version, formerVersion].map(loadDB));

  fs.writeFileSync(writeFileName, JSON.stringify(data));
};

concatenateDB(version);
