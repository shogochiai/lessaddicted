// Language detection and UI text
const translations = {
  en: {
    currentLabel: 'Current default list:',
    notSet: 'Not set',
    openSettings: 'Open Settings',
    openX: 'Open X',
    infoText: 'Set a default list to automatically display when opening X (Twitter).'
  },
  ja: {
    currentLabel: '現在のデフォルトリスト:',
    notSet: '未設定',
    openSettings: '設定を開く',
    openX: 'Xを開く',
    infoText: 'デフォルトリストを設定すると、X (Twitter) を開いた時に自動的にそのリストが表示されます。'
  }
};

// Get browser language
function getBrowserLanguage() {
  const lang = chrome.i18n.getUILanguage();
  // Check if it starts with 'ja' for Japanese
  return lang.startsWith('ja') ? 'ja' : 'en';
}

// Apply translations
function applyTranslations(lang) {
  const t = translations[lang] || translations.en;
  
  document.getElementById('currentLabel').textContent = t.currentLabel;
  document.getElementById('openOptions').textContent = t.openSettings;
  document.getElementById('openX').textContent = t.openX;
  document.getElementById('infoText').textContent = t.infoText;
  
  return t;
}

document.addEventListener('DOMContentLoaded', function() {
  // Detect language and apply translations
  const lang = getBrowserLanguage();
  const t = applyTranslations(lang);
  
  // Get current setting
  chrome.storage.sync.get(['defaultTabName', 'defaultListName'], function(data) {
    const currentListElement = document.getElementById('currentList');
    if (data.defaultTabName) {
      currentListElement.textContent = data.defaultTabName;
    } else if (data.defaultListName) {
      currentListElement.textContent = data.defaultListName;
    } else {
      currentListElement.textContent = t.notSet;
    }
  });

  // Open settings page
  document.getElementById('openOptions').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });

  // Open X in new tab
  document.getElementById('openX').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://x.com/home' });
  });
});