# Event Manager A

新人研修 A 向けの必須機能を備えた、依存パッケージなしのイベント管理サイトです。

## できること
- イベント一覧表示
- イベント詳細表示
- イベント作成
- イベント編集
- イベント削除
- イベント参加
- イベント参加キャンセル
- タイトル・会場・説明による検索
- 状態フィルター（すべて / 開催予定 / 終了済み / 満員）
- ブラウザ localStorage への保存

## ローカル起動
```bash
npm start
```

起動後の URL:

```text
http://localhost:3000
```

## GitHub Pages 公開
このプロジェクトは `index.html`, `styles.css`, `app.js` の静的ファイルだけで動くので、GitHub Pages にそのまま公開できます。

1. GitHub で新しいリポジトリを作る
2. このフォルダの中身をすべて push する
3. GitHub の Settings → Pages で、公開元を `Deploy from a branch`、ブランチを `main` / `/root` にする
4. 数分待つ
5. 公開 URL を開く

プロジェクトサイトの URL 例:

```text
https://<GitHubユーザー名>.github.io/<リポジトリ名>/
```

## 研修での確認観点
- フォーム入力エラーが正しく表示されるか
- 作成したイベントが一覧に出るか
- 編集内容が反映されるか
- 削除確認が働くか
- 参加 / キャンセルが人数表示に反映されるか
- 再読み込みしても localStorage の内容が残るか

## Smoke Test
`?smoke=1` を付けて開くと、内部スモークテストを走らせて結果を画面に表示します。

例:

```text
http://localhost:3000/?smoke=1
```
