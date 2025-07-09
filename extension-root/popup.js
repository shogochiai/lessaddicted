// State management
const AppState = {
  LOADING: 'loading',
  NO_LIST: 'noList',
  CHOOSING_LIST: 'choosingList',
  LIST_SELECTED: 'listSelected'
};

// Translations
const translations = {
  en: {
    language: 'EN',
    loading: 'Loading...',
    noListText: 'No default list selected',
    startSetup: 'Choose Default List',
    setupInstructions: 'Please go to X and click on the list tab you want to set as default. The extension will automatically detect your selection.',
    waitingForSelection: 'Waiting for list selection...',
    cancelSetup: 'Cancel',
    currentDefaultList: 'Current default list',
    openX: 'Open X',
    footerText: 'Automatically opens your selected list on X',
    confirmDelete: 'Delete default list?',
    deleteMessage: 'This will remove your default list setting.',
    delete: 'Delete',
    cancel: 'Cancel',
    updateList: 'Update list',
    deleteList: 'Delete list'
  },
  ja: {
    language: 'JA',
    loading: '読み込み中...',
    noListText: 'デフォルトリストが選択されていません',
    startSetup: 'デフォルトリストを選択',
    setupInstructions: 'Xに移動して、デフォルトに設定したいリストタブをクリックしてください。拡張機能が自動的に選択を検出します。',
    waitingForSelection: 'リストの選択を待っています...',
    cancelSetup: 'キャンセル',
    currentDefaultList: '現在のデフォルトリスト',
    openX: 'Xを開く',
    footerText: 'Xで選択したリストを自動的に開きます',
    confirmDelete: 'デフォルトリストを削除しますか？',
    deleteMessage: 'デフォルトリストの設定が削除されます。',
    delete: '削除',
    cancel: 'キャンセル',
    updateList: 'リストを更新',
    deleteList: 'リストを削除'
  }
};

// Current language
let currentLanguage = 'en';

// Get stored language or detect browser language
async function getLanguage() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['language'], (data) => {
      if (data.language) {
        resolve(data.language);
      } else {
        const browserLang = chrome.i18n.getUILanguage();
        resolve(browserLang.startsWith('ja') ? 'ja' : 'en');
      }
    });
  });
}

// Apply translations to the page
function applyTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[currentLanguage][key]) {
      element.textContent = translations[currentLanguage][key];
    }
  });
  
  // Update button titles
  document.getElementById('updateList')?.setAttribute('title', translations[currentLanguage].updateList);
  document.getElementById('deleteList')?.setAttribute('title', translations[currentLanguage].deleteList);
}

// Set app state
function setState(state) {
  // Hide all states
  document.querySelectorAll('.state-container').forEach(container => {
    container.classList.remove('active');
  });
  document.getElementById('loadingState').style.display = 'none';
  
  // Show current state
  switch (state) {
    case AppState.LOADING:
      document.getElementById('loadingState').style.display = 'flex';
      break;
    case AppState.NO_LIST:
      document.getElementById('noListState').classList.add('active');
      break;
    case AppState.CHOOSING_LIST:
      document.getElementById('chooseListState').classList.add('active');
      break;
    case AppState.LIST_SELECTED:
      document.getElementById('listSelectedState').classList.add('active');
      break;
  }
}

// Initialize popup
async function initializePopup() {
  setState(AppState.LOADING);
  
  // Get and apply language
  currentLanguage = await getLanguage();
  applyTranslations();
  
  // Check current state
  chrome.storage.sync.get(['defaultTabName', 'defaultListName', 'isSettingMode'], (data) => {
    if (data.isSettingMode) {
      setState(AppState.CHOOSING_LIST);
      // Open X.com if not already open
      chrome.tabs.query({ url: '*://x.com/*' }, (tabs) => {
        if (tabs.length === 0) {
          chrome.tabs.create({ url: 'https://x.com/home' });
        }
      });
    } else if (data.defaultTabName || data.defaultListName) {
      setState(AppState.LIST_SELECTED);
      const listName = data.defaultTabName || data.defaultListName;
      document.getElementById('selectedListName').textContent = listName;
    } else {
      setState(AppState.NO_LIST);
    }
  });
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      if (changes.defaultTabName) {
        if (changes.defaultTabName.newValue) {
          setState(AppState.LIST_SELECTED);
          document.getElementById('selectedListName').textContent = changes.defaultTabName.newValue;
        } else {
          setState(AppState.NO_LIST);
        }
      }
      if (changes.isSettingMode) {
        if (changes.isSettingMode.newValue) {
          setState(AppState.CHOOSING_LIST);
        }
      }
      if (changes.language) {
        currentLanguage = changes.language.newValue;
        applyTranslations();
      }
    }
  });
}

// Start setup process
function startSetup() {
  chrome.storage.sync.set({ isSettingMode: true }, () => {
    setState(AppState.CHOOSING_LIST);
    chrome.tabs.create({ url: 'https://x.com/home' });
  });
}

// Cancel setup process
function cancelSetup() {
  chrome.storage.sync.set({ isSettingMode: false }, () => {
    chrome.storage.sync.get(['defaultTabName', 'defaultListName'], (data) => {
      if (data.defaultTabName || data.defaultListName) {
        setState(AppState.LIST_SELECTED);
      } else {
        setState(AppState.NO_LIST);
      }
    });
  });
}

// Update list (restart setup)
function updateList() {
  startSetup();
}

// Delete list
function deleteList() {
  document.getElementById('confirmationDialog').classList.add('active');
}

// Confirm delete
function confirmDelete() {
  chrome.storage.sync.remove(['defaultTabName', 'defaultListName', 'defaultListUrl'], () => {
    document.getElementById('confirmationDialog').classList.remove('active');
    setState(AppState.NO_LIST);
  });
}

// Cancel delete
function cancelDelete() {
  document.getElementById('confirmationDialog').classList.remove('active');
}

// Toggle language
function toggleLanguage() {
  currentLanguage = currentLanguage === 'en' ? 'ja' : 'en';
  chrome.storage.sync.set({ language: currentLanguage }, () => {
    applyTranslations();
  });
}

// Open X with list
function openXWithList() {
  chrome.tabs.create({ url: 'https://x.com/home' });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  initializePopup();
  
  // Button click handlers
  document.getElementById('startSetup')?.addEventListener('click', startSetup);
  document.getElementById('cancelSetup')?.addEventListener('click', cancelSetup);
  document.getElementById('updateList')?.addEventListener('click', updateList);
  document.getElementById('deleteList')?.addEventListener('click', deleteList);
  document.getElementById('confirmDelete')?.addEventListener('click', confirmDelete);
  document.getElementById('cancelDelete')?.addEventListener('click', cancelDelete);
  document.getElementById('languageToggle')?.addEventListener('click', toggleLanguage);
  document.getElementById('openXWithList')?.addEventListener('click', openXWithList);
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'LIST_SELECTED' && request.listName) {
    // Update UI immediately when list is selected
    setState(AppState.LIST_SELECTED);
    document.getElementById('selectedListName').textContent = request.listName;
  }
});