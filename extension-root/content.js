// Debug logging
console.log('LessAddicted Extension: Content script loaded');

let isSettingMode = false;

// Get setting mode state from storage
chrome.storage.sync.get('isSettingMode', (data) => {
  isSettingMode = data.isSettingMode || false;
  console.log('Initial setting mode:', isSettingMode);
});

// Monitor setting mode changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes);
  if (namespace === 'sync' && changes.isSettingMode) {
    isSettingMode = changes.isSettingMode.newValue;
    if (isSettingMode) {
      console.log('Setting mode enabled');
      showSettingModeIndicator();
      // Re-enable all tabs for selection
      enableAllTabs();
    } else {
      hideSettingModeIndicator();
      // Re-apply grayout when leaving setting mode
      setTimeout(autoClickDefaultTab, 500);
    }
  }
});

// Enable all tabs for clicking (used in setting mode)
function enableAllTabs() {
  const tabs = document.querySelectorAll('[role="tablist"][data-testid="ScrollSnap-List"] a[role="tab"]');
  tabs.forEach(tab => {
    tab.style.opacity = '1';
    tab.style.filter = 'none';
    tab.style.pointerEvents = 'auto';
    tab.style.cursor = 'pointer';
  });
}

// Show setting mode indicator
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

// Capture click events
document.addEventListener('click', (event) => {
  console.log('Click detected, setting mode:', isSettingMode);
  
  if (!isSettingMode) return;
  
  // Check clicked element
  const target = event.target;
  const tabLink = target.closest('a[role="tab"]');
  
  // Check if a tab in the home page tab list was clicked
  if (tabLink) {
    const tabList = tabLink.closest('[role="tablist"]');
    if (tabList && tabList.getAttribute('data-testid') === 'ScrollSnap-List') {
      // Get text from the tab
      const tabTextElement = tabLink.querySelector('span');
      const tabName = tabTextElement ? tabTextElement.textContent.trim() : '';
      
      // Exclude 'For you' and 'Following'
      if (tabName && tabName !== 'For you' && tabName !== 'Following') {
        console.log('Custom tab found:', tabName);
        
        // Save settings
        chrome.storage.sync.set({ 
          defaultTabName: tabName,
          isSettingMode: false 
        }, () => {
          console.log(`Default tab set: ${tabName}`);
          // Get the message with proper substitution
          const message = chrome.i18n.getMessage('defaultTabSet', [tabName]);
          // Fallback if i18n fails
          const alertMessage = message || `Default tab set to: ${tabName}`;
          alert(alertMessage);
          isSettingMode = false;
        });
        
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
}, true);

// Auto-click the configured tab on page load and gray out others
function autoClickDefaultTab() {
  chrome.storage.sync.get(['defaultTabName', 'isSettingMode'], (data) => {
    const tabName = data.defaultTabName;
    const settingMode = data.isSettingMode || false;
    
    console.log('Auto-click check for tab:', tabName, 'Setting mode:', settingMode);
    
    // Don't apply grayout if in setting mode
    if (settingMode) {
      return;
    }
    
    if (tabName) {
      // Find tab list
      const tabList = document.querySelector('[role="tablist"][data-testid="ScrollSnap-List"]');
      if (tabList) {
        // Get all tabs
        const tabs = tabList.querySelectorAll('a[role="tab"]');
        let foundTab = false;
        
        // Find and click the configured tab, gray out others
        for (const tab of tabs) {
          const tabTextElement = tab.querySelector('span');
          if (tabTextElement) {
            const currentTabName = tabTextElement.textContent.trim();
            
            if (currentTabName === tabName) {
              console.log(`Clicking tab: ${tabName}`);
              tab.click();
              foundTab = true;
              // Ensure selected tab is not grayed out
              tab.style.opacity = '1';
              tab.style.filter = 'none';
              tab.style.pointerEvents = 'auto';
              tab.style.cursor = 'pointer';
            } else {
              // Gray out and disable all other tabs including "For you" and "Following"
              tab.style.opacity = '0.5';
              tab.style.filter = 'grayscale(100%)';
              tab.style.transition = 'opacity 0.3s, filter 0.3s';
              tab.style.pointerEvents = 'none';
              tab.style.cursor = 'not-allowed';
            }
          }
        }
        
        if (foundTab) {
          // Add styles to maintain gray state even on hover
          addGrayOutStyles();
        }
      }
    }
  });
}

// Add CSS to maintain gray out state
function addGrayOutStyles() {
  chrome.storage.sync.get(['defaultTabName', 'isSettingMode'], (data) => {
    const tabName = data.defaultTabName;
    const settingMode = data.isSettingMode || false;
    
    if (!document.getElementById('lessaddicted-grayout-styles')) {
      const style = document.createElement('style');
      style.id = 'lessaddicted-grayout-styles';
      style.textContent = `
        /* Gray out all custom list tabs by default */
        [role="tablist"][data-testid="ScrollSnap-List"] a[role="tab"] {
          transition: opacity 0.3s, filter 0.3s;
        }
        
        /* Keep the selected custom list visible */
        [role="tablist"][data-testid="ScrollSnap-List"] a[role="tab"][aria-selected="true"] {
          opacity: 1 !important;
          filter: none !important;
        }
      `;
      document.head.appendChild(style);
      
      // Apply gray out to non-selected custom lists dynamically
      const observer = new MutationObserver(() => {
        // Re-check setting mode on each mutation
        chrome.storage.sync.get(['isSettingMode'], (modeData) => {
          const currentSettingMode = modeData.isSettingMode || false;
          
          const tabs = document.querySelectorAll('[role="tablist"][data-testid="ScrollSnap-List"] a[role="tab"]');
          tabs.forEach(tab => {
            const tabTextElement = tab.querySelector('span');
            if (tabTextElement) {
              const currentTabName = tabTextElement.textContent.trim();
              const isSelected = tab.getAttribute('aria-selected') === 'true';
              
              // If in setting mode, make all tabs clickable
              if (currentSettingMode) {
                tab.style.opacity = '1';
                tab.style.filter = 'none';
                tab.style.pointerEvents = 'auto';
                tab.style.cursor = 'pointer';
              } else {
                // Apply gray out to all tabs except the selected one
                if (currentTabName === tabName && isSelected) {
                  // Ensure selected tab is fully visible and clickable
                  tab.style.opacity = '1';
                  tab.style.filter = 'none';
                  tab.style.pointerEvents = 'auto';
                  tab.style.cursor = 'pointer';
                } else if (currentTabName === tabName && !isSelected) {
                  // Keep default tab slightly visible but disabled until selected
                  tab.style.opacity = '0.8';
                  tab.style.filter = 'grayscale(50%)';
                  tab.style.pointerEvents = 'none';
                  tab.style.cursor = 'not-allowed';
                } else {
                  // Gray out and disable all other tabs including "For you" and "Following"
                  tab.style.opacity = '0.5';
                  tab.style.filter = 'grayscale(100%)';
                  tab.style.pointerEvents = 'none';
                  tab.style.cursor = 'not-allowed';
                }
              }
            }
          });
        });
      });
      
      // Observe tab list for changes
      const tabList = document.querySelector('[role="tablist"][data-testid="ScrollSnap-List"]');
      if (tabList) {
        observer.observe(tabList, { attributes: true, subtree: true, attributeFilter: ['aria-selected'] });
        // Initial application
        observer.takeRecords();
      }
    }
  });
}

// Wait for page to fully load
function waitForTabList() {
  let attempts = 0;
  const maxAttempts = 20;
  
  const checkInterval = setInterval(() => {
    attempts++;
    console.log(`Tab list check attempt ${attempts}/${maxAttempts}`);
    
    // Check if tab list is loaded
    const tabList = document.querySelector('[role="tablist"][data-testid="ScrollSnap-List"]');
    if (tabList || attempts >= maxAttempts) {
      clearInterval(checkInterval);
      if (tabList) {
        console.log('Tab list found, executing auto-click');
        // Add slight delay before clicking (wait for tabs to fully load)
        setTimeout(autoClickDefaultTab, 500);
      }
    }
  }, 500);
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(waitForTabList, 1000);
  });
} else {
  setTimeout(waitForTabList, 1000);
}

// Monitor URL changes (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed to:', url);
    // When returning to home page
    if (url.includes('/home') || url === 'https://x.com/' || url === 'https://twitter.com/') {
      setTimeout(waitForTabList, 1000);
    }
  }
}).observe(document, {subtree: true, childList: true});

// Monitor dynamic tab list additions
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

// Start observing when body is available
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