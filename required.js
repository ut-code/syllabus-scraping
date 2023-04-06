const fs = require("fs");
const rawData = fs.readFileSync("data-beautified2023.json").toString();
const data = JSON.parse(rawData);
const required = {};
const subjectName = {};
const required_2 = {};
const subjectName_2 = {};


data.forEach(e => {
    for (let i = 1; i < 40; i++) {
        const className_s1 = "s1_" + i;
        for (let i = 0; i < e.one_grade.length; i++) {
            if (className_s1 === e.one_grade[i]) {
                if (e.titleJp === '基礎化学' || e.titleJp === '基礎統計' || e.titleJp === '力学Ｂ') {
                } else {
                    if (className_s1 in required) {
                        required[className_s1].push(e.code);
                        subjectName[className_s1].push(e.titleJp);
                    } else {
                        required[className_s1] = [e.code];
                        subjectName[className_s1] = [e.titleJp];
                    }
                }
                
            }
        }
        for (let i = 0; i < e.two_grade.length; i++) {
            if (className_s1 === e.two_grade[i]) {
                if (e.titleJp === '図形科学Ｂ' || e.titleJp === '基礎統計' || e.titleJp === '常微分方程式' || e.titleJp === '有機反応化学') {
                } else {
                    if (className_s1 in required_2) {
                        required_2[className_s1].push(e.code);
                        subjectName_2[className_s1].push(e.titleJp);
                    } else {
                        required_2[className_s1] = [e.code];
                        subjectName_2[className_s1] = [e.titleJp];
                    }
                }
                
            }
        }
        const className_s2 = "s2_" + i;
        for (let i = 0; i < e.one_grade.length; i++) {
            if (className_s2 === e.one_grade[i]) {
                if (e.titleJp === '基礎化学' || e.titleJp === '基礎統計' || e.titleJp === '力学Ｂ' || e.titleJp === '数理科学基礎演習' || e.titleJp === '数学基礎理論演習') {
                } else {
                    if (className_s2 in required) {
                        required[className_s2].push(e.code);
                        subjectName[className_s2].push(e.titleJp);
                    } else {
                        required[className_s2] = [e.code];
                        subjectName[className_s2] = [e.titleJp];
                    }
                }
                
            }
        }
        for (let i = 0; i < e.two_grade.length; i++) {
            if (className_s2 === e.two_grade[i]) {
                if (e.titleJp === '図形科学Ｂ' || e.titleJp === '基礎統計' || e.titleJp === '常微分方程式' || e.titleJp === '有機反応化学') {
                } else {
                    if (className_s2 in required_2) {
                        required_2[className_s2].push(e.code);
                        subjectName_2[className_s2].push(e.titleJp);
                    } else {
                        required_2[className_s2] = [e.code];
                        subjectName_2[className_s2] = [e.titleJp];
                    }
                }
                
            }
        }
        const className_s3 = "s3_" + i;
        for (let i = 0; i < e.one_grade.length; i++) {
            if (className_s3 === e.one_grade[i]) {
                if (e.titleJp === '基礎化学' || e.titleJp === '基礎統計' || e.titleJp === '力学Ｂ' || e.titleJp === '数理科学基礎演習' || e.titleJp === '数学基礎理論演習') {
                } else {
                    if (className_s3 in required) {
                        required[className_s3].push(e.code);
                        subjectName[className_s3].push(e.titleJp);
                    } else {
                        required[className_s3] = [e.code];
                        subjectName[className_s3] = [e.titleJp];
                    }
                }
                
            }
        }
        for (let i = 0; i < e.two_grade.length; i++) {
            if (className_s3 === e.two_grade[i]) {
                if (e.titleJp === '図形科学Ｂ' || e.titleJp === '基礎統計' || e.titleJp === '常微分方程式' || e.titleJp === '有機反応化学') {
                } else {
                    if (className_s3 in required_2) {
                        required_2[className_s3].push(e.code);
                        subjectName_2[className_s3].push(e.titleJp);
                    } else {
                        required_2[className_s3] = [e.code];
                        subjectName_2[className_s3] = [e.titleJp];
                    }
                }
                
            }
        }
        const className_l1 = "l1_" + i;
        for (let i = 0; i < e.one_grade.length; i++) {
            if (className_l1 === e.one_grade[i]) {
                if (e.titleJp === '基礎化学' || e.titleJp === '基礎統計' || e.titleJp === '力学Ｂ') {
                } else {
                    if (className_l1 in required) {
                        required[className_l1].push(e.code);
                        subjectName[className_l1].push(e.titleJp);
                    } else {
                        required[className_l1] = [e.code];
                        subjectName[className_l1] = [e.titleJp];
                        if (!(className_l1 in required_2)){
                            required_2[className_l1] = [];
                        }
                    }
                }
                
            }
        }
        const className_l2 = "l2_" + i;
        for (let i = 0; i < e.one_grade.length; i++) {
            if (className_l2 === e.one_grade[i]) {
                if (e.titleJp === '基礎化学' || e.titleJp === '基礎統計' || e.titleJp === '力学Ｂ') {
                } else {
                    if (className_l2 in required) {
                        required[className_l2].push(e.code);
                        subjectName[className_l2].push(e.titleJp);
                    } else {
                        required[className_l2] = [e.code];
                        subjectName[className_l2] = [e.titleJp];
                        if (!(className_l2 in required_2)){
                            required_2[className_l2] = [];
                        }
                    }
                }
                
            }
        }
        const className_l3 = "l3_" + i;
        for (let i = 0; i < e.one_grade.length; i++) {
            if (className_l3 === e.one_grade[i]) {
                if (e.titleJp === '基礎化学' || e.titleJp === '基礎統計' || e.titleJp === '力学Ｂ') {
                } else {
                    if (className_l3 in required) {
                        required[className_l3].push(e.code);
                        subjectName[className_l3].push(e.titleJp);
                    } else {
                        required[className_l3] = [e.code];
                        subjectName[className_l3] = [e.titleJp];
                        if (!(className_l3 in required_2)){
                            required_2[className_l3] = [];
                        }
                    }
                }
                
            }
        }
    }
});

fs.writeFileSync("required.json", JSON.stringify(required));
console.log(subjectName);
fs.writeFileSync("required_2.json", JSON.stringify(required_2));
console.log(subjectName_2);
//console.log(nonRequired["s1"]);
