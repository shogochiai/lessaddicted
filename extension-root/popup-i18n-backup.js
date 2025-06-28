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
      // Chrome i18n APIを直接使用
      const notSetText = chrome.i18n.getMessage('notSet') || '未設定';
      currentListElement.textContent = notSetText;
    }
  });

  // 設定ページを開く
  const openOptionsBtn = document.getElementById('openOptions');
  if (openOptionsBtn) {
    openOptionsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  // Xを新しいタブで開く
  const openXBtn = document.getElementById('openX');
  if (openXBtn) {
    openXBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://x.com/home' });
    });
  }
  
  // data-i18n属性を持つ要素のテキストを更新
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const messageKey = element.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(messageKey);
    if (message) {
      if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
        element.value = message;
      } else {
        // currentListは特別扱い（データが読み込まれるまで維持）
        if (element.id !== 'currentList') {
          element.textContent = message;
        }
      }
    }
  });
});