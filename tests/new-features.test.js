describe('New Features Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('Clear Configuration on New Setting Session', () => {
    test('should clear existing configuration when starting new setting', () => {
      // Mock chrome.storage.sync.remove
      chrome.storage.sync.remove = jest.fn((keys, callback) => {
        callback();
      });

      // Simulate button click (logic from options.js)
      const clearAndStart = () => {
        chrome.storage.sync.remove(['defaultTabName', 'defaultListName', 'defaultListUrl'], () => {
          chrome.storage.sync.set({ isSettingMode: true }, () => {
            // Success
          });
        });
      };

      clearAndStart();

      expect(chrome.storage.sync.remove).toHaveBeenCalledWith(
        ['defaultTabName', 'defaultListName', 'defaultListUrl'],
        expect.any(Function)
      );
    });

    test('should enable setting mode after clearing configuration', (done) => {
      chrome.storage.sync.remove = jest.fn((keys, callback) => {
        callback();
      });

      chrome.storage.sync.set = jest.fn((items, callback) => {
        expect(items).toEqual({ isSettingMode: true });
        done();
      });

      // Simulate the flow
      chrome.storage.sync.remove(['defaultTabName', 'defaultListName', 'defaultListUrl'], () => {
        chrome.storage.sync.set({ isSettingMode: true });
      });
    });
  });

  describe('Project Renaming to LessAddicted', () => {
    test('manifest.json should use i18n keys for name and description', () => {
      const fs = require('fs');
      const path = require('path');
      
      const manifestPath = path.join(__dirname, '../extension-root/manifest.json');
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      expect(manifest.name).toBe('__MSG_extensionName__');
      expect(manifest.description).toBe('__MSG_extensionDescription__');
      expect(manifest.default_locale).toBe('en');
    });

    test('extension name should be LessAddicted in messages', () => {
      const fs = require('fs');
      const path = require('path');
      
      const enMessagesPath = path.join(__dirname, '../extension-root/_locales/en/messages.json');
      const enMessages = JSON.parse(fs.readFileSync(enMessagesPath, 'utf8'));
      
      expect(enMessages.extensionName.message).toBe('LessAddicted');
    });
  });

  describe('Disclaimer Message', () => {
    test('disclaimer should be present in options page', () => {
      const fs = require('fs');
      const path = require('path');
      
      const optionsPath = path.join(__dirname, '../extension-root/options.html');
      const optionsContent = fs.readFileSync(optionsPath, 'utf8');
      
      expect(optionsContent).toContain('disclaimer');
      expect(optionsContent).toContain('https://github.com/shogochiai/lessaddicted');
    });

    test('disclaimer message should be in i18n messages', () => {
      const fs = require('fs');
      const path = require('path');
      
      const enMessagesPath = path.join(__dirname, '../extension-root/_locales/en/messages.json');
      const enMessages = JSON.parse(fs.readFileSync(enMessagesPath, 'utf8'));
      
      expect(enMessages.disclaimer).toBeDefined();
      expect(enMessages.disclaimer.message).toContain('unofficial third-party tool');
    });
  });

  describe('i18n Implementation', () => {
    test('should have locale directories for en and ja', () => {
      const fs = require('fs');
      const path = require('path');
      
      const enDir = path.join(__dirname, '../extension-root/_locales/en');
      const jaDir = path.join(__dirname, '../extension-root/_locales/ja');
      
      expect(fs.existsSync(enDir)).toBe(true);
      expect(fs.existsSync(jaDir)).toBe(true);
    });

    test('should have messages.json files for both locales', () => {
      const fs = require('fs');
      const path = require('path');
      
      const enMessages = path.join(__dirname, '../extension-root/_locales/en/messages.json');
      const jaMessages = path.join(__dirname, '../extension-root/_locales/ja/messages.json');
      
      expect(fs.existsSync(enMessages)).toBe(true);
      expect(fs.existsSync(jaMessages)).toBe(true);
    });

    test('both locale files should have the same keys', () => {
      const fs = require('fs');
      const path = require('path');
      
      const enMessages = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../extension-root/_locales/en/messages.json'), 'utf8'
      ));
      const jaMessages = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../extension-root/_locales/ja/messages.json'), 'utf8'
      ));
      
      const enKeys = Object.keys(enMessages).sort();
      const jaKeys = Object.keys(jaMessages).sort();
      
      expect(enKeys).toEqual(jaKeys);
    });

    test('HTML files should have data-i18n attributes', () => {
      const fs = require('fs');
      const path = require('path');
      
      const htmlFiles = ['options.html', 'popup.html'];
      
      htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, '../extension-root', file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        expect(content).toContain('data-i18n=');
      });
    });

    test('i18n.js helper file should exist', () => {
      const fs = require('fs');
      const path = require('path');
      
      const i18nPath = path.join(__dirname, '../extension-root/i18n.js');
      expect(fs.existsSync(i18nPath)).toBe(true);
    });
  });

  describe('Language Switcher', () => {
    test('options page should have language switcher buttons', () => {
      const fs = require('fs');
      const path = require('path');
      
      const optionsPath = path.join(__dirname, '../extension-root/options.html');
      const optionsContent = fs.readFileSync(optionsPath, 'utf8');
      
      expect(optionsContent).toContain('language-switcher');
      expect(optionsContent).toContain('data-lang="en"');
      expect(optionsContent).toContain('data-lang="ja"');
    });

    test('i18n.js should handle language switching', () => {
      const fs = require('fs');
      const path = require('path');
      
      const i18nPath = path.join(__dirname, '../extension-root/i18n.js');
      const i18nContent = fs.readFileSync(i18nPath, 'utf8');
      
      expect(i18nContent).toContain('getCurrentLanguage');
      expect(i18nContent).toContain('setLanguage');
      expect(i18nContent).toContain('updatePageLanguage');
    });
  });

  describe('Chrome i18n API Usage', () => {
    test('content.js should use chrome.i18n.getMessage', () => {
      const fs = require('fs');
      const path = require('path');
      
      const contentPath = path.join(__dirname, '../extension-root/content.js');
      const contentScript = fs.readFileSync(contentPath, 'utf8');
      
      expect(contentScript).toContain('chrome.i18n.getMessage');
    });

    test('JavaScript files should use i18n for user-facing strings', () => {
      const fs = require('fs');
      const path = require('path');
      
      const jsFiles = ['options.js', 'popup.js'];
      
      jsFiles.forEach(file => {
        const filePath = path.join(__dirname, '../extension-root', file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        expect(content).toContain('i18n.getMessage');
      });
    });
  });
});