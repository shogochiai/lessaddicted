# Chrome Extension 開発工程指示書

## 概要
このドキュメントは、X（旧Twitter）で任意のリストをデフォルト表示にするChrome Extensionの開発工程を詳細に解説するものです。ユーザーが選択したリストを自動で表示する機能を備え、パイロットテストが実施できる状態を目指します。開発からテスト、引き継ぎまでをカバーします。

## 機能要件
- ユーザーが「デフォルト設定したいリストタブをクリックしてください」という案内をもとに、リストタブをクリックして設定可能。
- 設定したリストタブがページ読み込み時に自動でクリックされ、表示される。
- XのHTML構造変更に柔軟に対応し、ユーザーが再設定できる設計。

## 開発環境
- **ブラウザ**: Google Chrome（最新版推奨）
- **言語**: JavaScript, HTML, CSS
- **ツール**: Chrome Extension API, `chrome.storage`

## ファイル構成
```
extension-root/
  ├── manifest.json       # 拡張機能の設定ファイル
  ├── content.js          # Xページで動作するスクリプト
  ├── options.html        # 設定画面のUI
  ├── options.js          # 設定画面の動作制御
  ├── popup.html          # 拡張機能アイコンクリック時のポップアップ
  └── popup.js            # ポップアップの動作制御（今回は簡易的な実装）
```

## 詳細設計

### 1. manifest.json
拡張機能の基本設定を定義。Xのページで動作するcontent scriptとstorage権限を指定します。

```json
{
  "manifest_version": 3,
  "name": "X List Default",
  "version": "1.0",
  "description": "Xで任意のリストをデフォルト表示にするChrome拡張機能",
  "permissions": ["storage"],
  "content_scripts": [
    {
      "matches": ["https://x.com/*"],
      "js": ["content.js"]
    }
  ],
  "options_page": "options.html"
}
```

### 2. content.js
Xページで動作するスクリプト。ユーザーのクリックを捕捉してリストを保存し、ページ読み込み時に自動クリックします。

```javascript
// ユーザーがリストタブをクリックした際にセレクタを保存
document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-list-id]');
  if (target) {
    const listSelector = target.getAttribute('data-list-id');
    chrome.storage.sync.set({ defaultListSelector: listSelector }, () => {
      console.log(`デフォルトリストが設定されました: ${listSelector}`);
    });
  }
});

// ページ読み込み時に設定済みのリストタブを自動クリック
window.addEventListener('load', () => {
  chrome.storage.sync.get('defaultListSelector', (data) => {
    const selector = data.defaultListSelector;
    if (selector) {
      const listTab = document.querySelector(`[data-list-id="${selector}"]`);
      if (listTab) {
        listTab.click();
        console.log(`リストタブ ${selector} を自動クリックしました`);
      } else {
        console.log('設定したリストタブが見つかりません。再設定してください。');
      }
    }
  });
});
```

### 3. options.html
ユーザーがデフォルトリストを設定するためのシンプルな設定画面。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>X List Default 設定</title>
</head>
<body>
  <h1>デフォルトリストの設定</h1>
  <p>画面上のデフォルト設定したいリストタブをクリックしてください。</p>
  <button id="save">設定を開始</button>
  <script src="options.js"></script>
</body>
</html>
```

### 4. options.js
設定画面の動作を制御。ユーザーにクリックを促す案内を表示します。

```javascript
document.getElementById('save').addEventListener('click', () => {
  alert('Xのページで、デフォルトにしたいリストタブをクリックしてください。設定が保存されます。');
  // 実際のクリック捕捉はcontent.jsで処理
});
```

### 5. popup.html
拡張機能アイコンをクリックした際に表示されるポップアップ画面。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>X List Default</title>
</head>
<body>
  <h1>X List Default</h1>
  <p>設定は「拡張機能のオプション」から行ってください。</p>
</body>
</html>
```

## 開発手順
以下のステップを順に実行してください。

### 1. プロジェクトフォルダの作成
- 任意の場所に`extension-root`フォルダを作成。
- 上記のファイル構成に従い、各ファイルを配置。

### 2. manifest.jsonの設定
- `manifest.json`に上記の内容をコピー＆ペースト。
- 保存して閉じる。

### 3. content.jsの実装
- `content.js`に上記のコードを記述。
- リストタブのセレクタ（例: `data-list-id`）はXの実際のHTML構造に依存するため、必要に応じて調整。

### 4. options.htmlとoptions.jsの実装
- `options.html`と`options.js`に上記のコードを記述。
- ユーザーが設定手順を理解しやすい文言を心がける。

### 5. popup.htmlの作成
- `popup.html`に上記のコードを記述。
- 必要に応じてデザインを調整。

### 6. 拡張機能のインストール
- Chromeを開き、`chrome://extensions/`にアクセス。
- 右上の「デベロッパーモード」をオン。
- 「パッケージ化されていない拡張機能を読み込む」をクリックし、`extension-root`フォルダを選択。

### 7. 動作確認
- X（`https://x.com`）にアクセス。
- 拡張機能の「オプション」を開き、「設定を開始」ボタンをクリック。
- Xのリストタブをクリックして設定。
- ページをリロードし、設定したリストが自動表示されるか確認。

## パイロットテスト
以下の項目をテストし、動作を確認してください。

### テスト項目
- **リスト設定**: リストタブをクリックするとセレクタが正しく保存されるか。
- **自動表示**: ページ読み込み時に設定したリストが表示されるか。
- **エラー対応**: リストタブが見つからない場合にログで通知されるか。

### テスト手順
1. Xにアクセスし、リストタブを1つ選択して設定。
2. ページをリロードし、選択したリストが表示されることを確認。
3. 別のリストを設定し直し、再びリロードして動作を確認。
4. コンソールログ（開発者ツール: `Ctrl+Shift+J`）でエラーがないか確認。

### 想定される問題と対処法
- **リストタブが見つからない**: XのHTML構造が変わった可能性。`content.js`のセレクタを更新。
- **自動クリックが動作しない**: `window.addEventListener('load')`のタイミングが遅い場合、`setTimeout`で遅延を追加。

## 引き継ぎ準備

### ドキュメント
- この指示書を`README.md`として保存し、プロジェクトルートに配置。
- 各コードにコメントを追加し、動作の意図を明確化。

### バージョン管理
- GitHubリポジトリを作成し、プロジェクトをアップロード。
- チームメンバーとリポジトリURLを共有。

### 今後の改善案
- **視覚的フィードバック**: リストタブ選択時にハイライト表示を追加。
- **多機能化**: 複数のリストを保存し、切り替え可能に。
- **エラー通知**: ポップアップでユーザー向けにエラーメッセージを表示。

## まとめ
この指示書に従えば、Chrome Extensionの開発からパイロットテストまで進められます。不明点があれば、開発者向けに質問を受け付けるチャネルを用意してください。パイロットテストで問題がなければ、正式リリースへ移行可能です。
```

このドキュメントは、開発初心者でも理解しやすいように手順を細かく記述し、実際のコード例を含めています。パイロットテストの具体的な手順や引き継ぎ準備も網羅しており、次の担当者がスムーズに引き継げる状態です。何か追加の質問があればお気軽にどうぞ！
