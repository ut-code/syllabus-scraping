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
node scrape.js
node process.js
node required.js
```

これにより生成された`processed{学期}.json`及び`required{学期}.json`を、フロントエンド側の`classList`フォルダにコピーする

## 各jsonファイルの内容

- `raw{学期}.json`: スクレイピングした内容(無編集)
- `processed{学期}.json`: 文字列の正規化やZoom URLの削除、プロパティの追加等を行い、フロントエンド側で利用できるようにしたデータ
- `required{学期}.json`: 各クラスの必修科目のコード
- `concatenated{学期}.json`: 直近2学期の`processed{学期}.json`を結合したもの。現在は使用していない。
- `requiredTitle{学期}.json`: `required{学期}.json`生成時の参照講義名一覧。デバッグ用。
