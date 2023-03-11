const fs = require("fs");
let rawData = fs.readFileSync("data.json").toString() + fs.readFileSync("data2.json").toString();
rawData = rawData.replace(/\s+/g, " ");
rawData = rawData.replace(/\\n\s/g, "");
const data = JSON.parse(rawData);
data.forEach(e => {
    e.class_temp = e.class.split("(").join(" ");
    e.class_temp = e.class_temp.split(")").join("");
    e.class_temp = e.class_temp.split(" ");
});

fs.writeFileSync("data-beautified.json", JSON.stringify(data));