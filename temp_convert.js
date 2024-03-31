const fs = require("fs");

const versions = ["2022A", "2023S", "2023A", "2024S"];

for (const version of versions) {
  const required_1 = JSON.parse(
    fs.readFileSync(`${version}_required.json`).toString()
  );
  const required_2 = JSON.parse(
    fs.readFileSync(`${version}_required_2.json`).toString()
  );
  const required_unified = [required_1, required_2];
  fs.writeFileSync(
    `requiredClassCode${version}.json`,
    JSON.stringify(required_unified)
  );
}
