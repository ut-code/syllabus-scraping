# syllabus-scraping
[履修登録支援システム「シ楽バス」](https://github.com/ut-code/syllabus-frontend) スクレイピング用リポジトリ

## 環境構築

```bash
git clone https://github.com/ut-code/syllabus-scraping
cd syllabus-scraping
npm install
```
## 半期毎のデータの更新

version.jsonの中を取得したいセメスターを示す文字列に変更した上で、以下を行う

```bash
node scraping.js
node process.js
node required.js
```

これにより生成された`processed{学期}.json`及び`required{学期}.json`を、フロントエンド側の`classList`フォルダにコピーする
