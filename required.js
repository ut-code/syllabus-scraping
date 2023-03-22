const fs = require("fs");
const rawData = fs.readFileSync("data-beautified.json").toString();
const data = JSON.parse(rawData);
const required = {};
const subjectName = {};

data.forEach(e => {
    for (let i = 1; i < 40; i++) {
        const className = "s1_" + i;
        for (let i = 0; i < e.one_grade.length; i++) {
            if (className === e.one_grade[i]) {
                if (className in required) {
                    required[className].push(e.code);
                    subjectName[className].push(e.titleJp);
                } else {
                    required[className] = [e.code];
                    subjectName[className] = [e.titleJp];
                }
            }
        }
    }
});

fs.writeFileSync("required.json", JSON.stringify(required));
console.log(subjectName);
