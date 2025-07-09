// i18n helper function
function getMessage(key) {
  if (window.i18n && window.i18n.getMessage) {
    return i18n.getMessage(key);
  } else {
    return chrome.i18n.getMessage(key) || key;
  }
}

// Display current settings
function displayCurrentSetting() {
  chrome.storage.sync.get(['defaultTabName', 'defaultListName'], (data) => {
    const listNameElement = document.getElementById('listName');
    if (data.defaultTabName) {
      listNameElement.textContent = data.defaultTabName;
    } else if (data.defaultListName) {
      // Backward compatibility
      listNameElement.textContent = data.defaultListName;
    } else {
      listNameElement.textContent = getMessage('notSet') || '未設定';
    }
  });
}

// Show status message
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

// Execute when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Display current settings
  displayCurrentSetting();
  
  // Start setting button click event
  document.getElementById('startSetting').addEventListener('click', () => {
    // Clear existing settings before starting new setup
    chrome.storage.sync.remove(['defaultTabName', 'defaultListName', 'defaultListUrl'], () => {
      // Enable setting mode
      chrome.storage.sync.set({ isSettingMode: true }, () => {
        showStatus('settingModeEnabled');
        displayCurrentSetting(); // Update display
        
        // Open X (Twitter) in new tab
        chrome.tabs.create({ url: 'https://x.com/home' }, (tab) => {
          // Automatically disable setting mode after 5 minutes
          setTimeout(() => {
            chrome.storage.sync.set({ isSettingMode: false });
          }, 300000);
        });
      });
    });
  });

  // Clear settings button click event
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

// Monitor storage changes
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