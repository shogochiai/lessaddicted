// content.js の単体テスト（分離版）
// content.js のコードを直接インポートできないため、機能を分離してテスト

describe('Content Script Functions', () => {
  let showSettingModeIndicator;
  let hideSettingModeIndicator;
  let handleTabClick;
  let autoClickDefaultTab;

  beforeEach(() => {
    // DOM リセット
    document.body.innerHTML = '';
    
    // 関数の実装（content.jsから抽出）
    showSettingModeIndicator = () => {
      const indicator = document.createElement('div');
      indicator.id = 'x-list-default-indicator';
      indicator.textContent = '設定モード: ホーム画面上部のタブをクリックしてください';
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
    };

    hideSettingModeIndicator = () => {
      const indicator = document.getElementById('x-list-default-indicator');
      if (indicator) {
        indicator.remove();
      }
    };

    handleTabClick = (event, isSettingMode) => {
      if (!isSettingMode) return null;
      
      const target = event.target;
      const tabLink = target.closest('a[role="tab"]');
      
      if (tabLink) {
        const tabList = tabLink.closest('[role="tablist"]');
        if (tabList && tabList.getAttribute('data-testid') === 'ScrollSnap-List') {
          const tabTextElement = tabLink.querySelector('span');
          const tabName = tabTextElement ? tabTextElement.textContent.trim() : '';
          
          if (tabName && tabName !== 'For you' && tabName !== 'Following') {
            return {
              tabName,
              shouldSave: true
            };
          }
        }
      }
      return null;
    };

    autoClickDefaultTab = (tabName) => {
      if (!tabName) return false;
      
      const tabList = document.querySelector('[role="tablist"][data-testid="ScrollSnap-List"]');
      if (tabList) {
        const tabs = tabList.querySelectorAll('a[role="tab"]');
        
        for (const tab of tabs) {
          const tabTextElement = tab.querySelector('span');
          if (tabTextElement && tabTextElement.textContent.trim() === tabName) {
            tab.click();
            return true;
          }
        }
      }
      return false;
    };
  });

  describe('Setting Mode Indicator', () => {
    test('should show indicator', () => {
      showSettingModeIndicator();
      
      const indicator = document.getElementById('x-list-default-indicator');
      expect(indicator).toBeTruthy();
      expect(indicator.textContent).toContain('設定モード');
      expect(indicator.style.position).toBe('fixed');
    });

    test('should hide indicator', () => {
      // まずインジケーターを表示
      showSettingModeIndicator();
      expect(document.getElementById('x-list-default-indicator')).toBeTruthy();
      
      // インジケーターを非表示
      hideSettingModeIndicator();
      expect(document.getElementById('x-list-default-indicator')).toBeFalsy();
    });

    test('should handle hiding non-existent indicator', () => {
      // インジケーターが存在しない状態で非表示を試みる
      expect(() => hideSettingModeIndicator()).not.toThrow();
    });
  });

  describe('Tab Click Handler', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div role="tablist" data-testid="ScrollSnap-List">
          <a href="/home" role="tab">
            <span>For you</span>
          </a>
          <a href="/home" role="tab">
            <span>Agriculture</span>
          </a>
        </div>
      `;
    });

    test('should detect custom tab click in setting mode', () => {
      const tab = document.querySelector('a[role="tab"]:nth-child(2)');
      const event = { target: tab.querySelector('span') };
      
      const result = handleTabClick(event, true);
      
      expect(result).toBeTruthy();
      expect(result.tabName).toBe('Agriculture');
      expect(result.shouldSave).toBe(true);
    });

    test('should ignore For you tab', () => {
      const tab = document.querySelector('a[role="tab"]:first-child');
      const event = { target: tab };
      
      const result = handleTabClick(event, true);
      
      expect(result).toBeFalsy();
    });

    test('should ignore clicks when not in setting mode', () => {
      const tab = document.querySelector('a[role="tab"]:nth-child(2)');
      const event = { target: tab };
      
      const result = handleTabClick(event, false);
      
      expect(result).toBeFalsy();
    });

    test('should handle clicks on nested elements', () => {
      const span = document.querySelector('a[role="tab"]:nth-child(2) span');
      const event = { target: span };
      
      const result = handleTabClick(event, true);
      
      expect(result).toBeTruthy();
      expect(result.tabName).toBe('Agriculture');
    });
  });

  describe('Auto Click Default Tab', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div role="tablist" data-testid="ScrollSnap-List">
          <a href="/home" role="tab">
            <span>For you</span>
          </a>
          <a href="/home" role="tab">
            <span>Agriculture</span>
          </a>
          <a href="/home" role="tab">
            <span>Hunting</span>
          </a>
        </div>
      `;
      
      // クリックをモック
      document.querySelectorAll('a[role="tab"]').forEach(tab => {
        tab.click = jest.fn();
      });
    });

    test('should click the correct tab', () => {
      const result = autoClickDefaultTab('Agriculture');
      
      expect(result).toBe(true);
      const tabs = document.querySelectorAll('a[role="tab"]');
      expect(tabs[1].click).toHaveBeenCalled();
      expect(tabs[0].click).not.toHaveBeenCalled();
      expect(tabs[2].click).not.toHaveBeenCalled();
    });

    test('should return false when tab not found', () => {
      const result = autoClickDefaultTab('NonExistentTab');
      
      expect(result).toBe(false);
      const tabs = document.querySelectorAll('a[role="tab"]');
      tabs.forEach(tab => {
        expect(tab.click).not.toHaveBeenCalled();
      });
    });

    test('should return false when no tab name provided', () => {
      const result = autoClickDefaultTab('');
      
      expect(result).toBe(false);
    });

    test('should return false when tab list not found', () => {
      document.body.innerHTML = '';
      
      const result = autoClickDefaultTab('Agriculture');
      
      expect(result).toBe(false);
    });
  });
});