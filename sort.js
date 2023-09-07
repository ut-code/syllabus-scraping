const fs = require("fs");
const rawData = fs.readFileSync("2023S-beautified.json").toString();
const data = JSON.parse(rawData);

const peak = [];
const Jp = [];
const compulsory_subject = [];
const general_subject = {"Ａ": [], "Ｂ": [], "Ｃ": [], "Ｄ": [], "Ｅ": [], "Ｆ": [], "Ｌ": []};
const gen_keys = Object.keys(general_subject);
const requested_subject = [];
const theme_subject = [];
const broad_subject = [];
const sophomore = [];
const rest = []; //残りの優先度高めの授業

data.forEach(e => {
    if (e.titleJp.includes("PEAK")) {
        peak.push(e);
    } else if (e.titleJp.includes("日本語") && e.titleJp.includes("級")) {
        Jp.push(e);
    } else if (e.type === "基礎") {
        compulsory_subject.push(e);
    } else if (e.type === "総合") {
        for (key of gen_keys) {
            if (e.category.includes(key)) {
                general_subject[key].push(e);
                break;
            } 
        }
    } else if (e.type === "要求") {
        requested_subject.push(e);
    } else if (e.type === "主題") {
        theme_subject.push(e);
    } else if (e.type === "展開") {
        broad_subject.push(e);
    } else {
        console.log(e.type, e.titleJp);
    }
});

var sorted = compulsory_subject;
console.log(compulsory_subject.length, sorted.length);
for (key of gen_keys) {
    sorted = sorted.concat(general_subject[key]);
    console.log(general_subject[key].length, sorted.length);
} 
console.log(sorted.length);
sorted = sorted.concat(general_subject, theme_subject, requested_subject, broad_subject, peak, Jp);

console.log(sorted.length);
fs.writeFileSync("2023S_sorted.json", JSON.stringify(sorted));