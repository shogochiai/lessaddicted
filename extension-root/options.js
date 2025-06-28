// i18n ヘルパー関数
function getMessage(key) {
  if (window.i18n && window.i18n.getMessage) {
    return i18n.getMessage(key);
  } else {
    return chrome.i18n.getMessage(key) || key;
  }
}

// 現在の設定を表示
function displayCurrentSetting() {
  chrome.storage.sync.get(['defaultTabName', 'defaultListName'], (data) => {
    const listNameElement = document.getElementById('listName');
    if (data.defaultTabName) {
      listNameElement.textContent = data.defaultTabName;
    } else if (data.defaultListName) {
      // 旧バージョンとの互換性
      listNameElement.textContent = data.defaultListName;
    } else {
      listNameElement.textContent = getMessage('notSet') || '未設定';
    }
  });
}

// ステータスメッセージを表示
function showStatus(messageKey, isError = false) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = getMessage(messageKey);
  statusElement.style.display = 'block';
  statusElement.style.backgroundColor = isError ? '#fee2e2' : '#e8f5fe';
  statusElement.style.color = isError ? '#dc2626' : '#1e40af';
  
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
  // 現在の設定を表示
  displayCurrentSetting();
  
  // 設定開始ボタンのクリックイベント
  document.getElementById('startSetting').addEventListener('click', () => {
    // 既存の設定をクリアしてから新しい設定を開始
    chrome.storage.sync.remove(['defaultTabName', 'defaultListName', 'defaultListUrl'], () => {
      // 設定モードを有効化
      chrome.storage.sync.set({ isSettingMode: true }, () => {
        showStatus('settingModeEnabled');
        displayCurrentSetting(); // 表示を更新
        
        // X (Twitter) の新しいタブを開く
        chrome.tabs.create({ url: 'https://x.com/home' }, (tab) => {
          // 5分後に自動的に設定モードを無効化
          setTimeout(() => {
            chrome.storage.sync.set({ isSettingMode: false });
          }, 300000);
        });
      });
    });
  });

  // 設定クリアボタンのクリックイベント
  document.getElementById('clearSetting').addEventListener('click', () => {
    const confirmMessage = getMessage('clearConfirm') || '現在の設定をクリアしますか？';
    if (confirm(confirmMessage)) {
      chrome.storage.sync.clear(() => {
        showStatus('settingsCleared');
        displayCurrentSetting();
      });
    }
  });
});

// storage の変更を監視
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.defaultTabName || changes.defaultListName || changes.defaultListUrl) {
      displayCurrentSetting();
      if (changes.isSettingMode && changes.isSettingMode.newValue === false) {
        showStatus('newListSet');
      }
    }
  }
});