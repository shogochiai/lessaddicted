// シンプルなポップアップスクリプト（i18nなし）
document.addEventListener('DOMContentLoaded', function() {
  // 現在の設定を表示
  chrome.storage.sync.get(['defaultTabName', 'defaultListName'], function(data) {
    const currentListElement = document.getElementById('currentList');
    if (data.defaultTabName) {
      currentListElement.textContent = data.defaultTabName;
    } else if (data.defaultListName) {
      currentListElement.textContent = data.defaultListName;
    } else {
      currentListElement.textContent = '未設定';
    }
  });

  // 設定ページを開く
  document.getElementById('openOptions').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });

  // Xを新しいタブで開く
  document.getElementById('openX').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://x.com/home' });
  });
});