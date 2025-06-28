// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
  // 現在の設定を表示
  chrome.storage.sync.get(['defaultTabName', 'defaultListName'], (data) => {
    const currentListElement = document.getElementById('currentList');
    if (data.defaultTabName) {
      currentListElement.textContent = data.defaultTabName;
    } else if (data.defaultListName) {
      // 旧バージョンとの互換性
      currentListElement.textContent = data.defaultListName;
    } else {
      // i18nが初期化されているか確認
      if (window.i18n && window.i18n.getMessage) {
        currentListElement.textContent = i18n.getMessage('notSet');
      } else {
        currentListElement.textContent = chrome.i18n.getMessage('notSet') || '未設定';
      }
    }
  });

  // 設定ページを開く
  document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Xを新しいタブで開く
  document.getElementById('openX').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://x.com/home' });
  });
});