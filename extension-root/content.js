// デバッグ用のログ出力
console.log('LessAddicted Extension: Content script loaded');

let isSettingMode = false;

// 設定モードの状態を取得
chrome.storage.sync.get('isSettingMode', (data) => {
  isSettingMode = data.isSettingMode || false;
  console.log('Initial setting mode:', isSettingMode);
});

// 設定モードの変更を監視
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes);
  if (namespace === 'sync' && changes.isSettingMode) {
    isSettingMode = changes.isSettingMode.newValue;
    if (isSettingMode) {
      console.log('Setting mode enabled');
      showSettingModeIndicator();
    } else {
      hideSettingModeIndicator();
    }
  }
});

// 設定モードのインジケーターを表示
function showSettingModeIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'x-list-default-indicator';
  indicator.textContent = chrome.i18n.getMessage('settingModeIndicator');
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #1da1f2;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-size: 16px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  `;
  document.body.appendChild(indicator);
}

function hideSettingModeIndicator() {
  const indicator = document.getElementById('x-list-default-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// クリックイベントをキャプチャ
document.addEventListener('click', (event) => {
  console.log('Click detected, setting mode:', isSettingMode);
  
  if (!isSettingMode) return;
  
  // クリックされた要素を確認
  const target = event.target;
  const tabLink = target.closest('a[role="tab"]');
  
  // ホームページのタブリスト内のタブがクリックされたか確認
  if (tabLink) {
    const tabList = tabLink.closest('[role="tablist"]');
    if (tabList && tabList.getAttribute('data-testid') === 'ScrollSnap-List') {
      // タブ内のテキストを取得
      const tabTextElement = tabLink.querySelector('span');
      const tabName = tabTextElement ? tabTextElement.textContent.trim() : '';
      
      // For youとFollowingは除外
      if (tabName && tabName !== 'For you' && tabName !== 'Following') {
        console.log('Custom tab found:', tabName);
        
        // 設定を保存
        chrome.storage.sync.set({ 
          defaultTabName: tabName,
          isSettingMode: false 
        }, () => {
          console.log(`Default tab set: ${tabName}`);
          const message = chrome.i18n.getMessage('defaultTabSet', tabName);
          alert(message);
          isSettingMode = false;
        });
        
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
}, true);

// ページ読み込み時に設定済みのタブを自動クリック
function autoClickDefaultTab() {
  chrome.storage.sync.get(['defaultTabName'], (data) => {
    const tabName = data.defaultTabName;
    
    console.log('Auto-click check for tab:', tabName);
    
    if (tabName) {
      // タブリストを探す
      const tabList = document.querySelector('[role="tablist"][data-testid="ScrollSnap-List"]');
      if (tabList) {
        // すべてのタブを取得
        const tabs = tabList.querySelectorAll('a[role="tab"]');
        
        // 設定されたタブを探してクリック
        for (const tab of tabs) {
          const tabTextElement = tab.querySelector('span');
          if (tabTextElement && tabTextElement.textContent.trim() === tabName) {
            console.log(`Clicking tab: ${tabName}`);
            tab.click();
            break;
          }
        }
      }
    }
  });
}

// ページの完全読み込みを待つ
function waitForTabList() {
  let attempts = 0;
  const maxAttempts = 20;
  
  const checkInterval = setInterval(() => {
    attempts++;
    console.log(`Tab list check attempt ${attempts}/${maxAttempts}`);
    
    // タブリストが読み込まれているか確認
    const tabList = document.querySelector('[role="tablist"][data-testid="ScrollSnap-List"]');
    if (tabList || attempts >= maxAttempts) {
      clearInterval(checkInterval);
      if (tabList) {
        console.log('Tab list found, executing auto-click');
        // 少し遅延を入れてからクリック（タブの読み込み完了を待つ）
        setTimeout(autoClickDefaultTab, 500);
      }
    }
  }, 500);
}

// 初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(waitForTabList, 1000);
  });
} else {
  setTimeout(waitForTabList, 1000);
}

// URLの変更を監視（SPAのナビゲーションに対応）
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed to:', url);
    // ホームページに戻った時
    if (url.includes('/home') || url === 'https://x.com/' || url === 'https://twitter.com/') {
      setTimeout(waitForTabList, 1000);
    }
  }
}).observe(document, {subtree: true, childList: true});

// タブリストの動的な追加を監視
const observer = new MutationObserver((mutations) => {
  if (!isSettingMode && window.location.pathname === '/home') {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const hasTabList = Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType === 1) {
            return node.querySelector && node.querySelector('[role="tablist"][data-testid="ScrollSnap-List"]');
          }
          return false;
        });
        
        if (hasTabList) {
          console.log('Tab list added dynamically');
          setTimeout(autoClickDefaultTab, 500);
          break;
        }
      }
    }
  }
});

// bodyが利用可能になったら監視開始
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

console.log('LessAddicted Extension: Setup complete');