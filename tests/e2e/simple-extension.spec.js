const { test, expect } = require('@playwright/test');

test.describe('LessAddicted Extension - Simple Tests', () => {
  test('Manifest.json should be valid', async () => {
    const fs = require('fs');
    const path = require('path');
    
    const manifestPath = path.join(__dirname, '../../extension-root/manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // 必須フィールドの確認
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe('__MSG_extensionName__');
    expect(manifest.description).toBe('__MSG_extensionDescription__');
    expect(manifest.default_locale).toBe('en');
    expect(manifest.version).toBe('1.0');
    expect(manifest.permissions).toContain('storage');
    expect(manifest.content_scripts).toBeDefined();
    expect(manifest.content_scripts[0].matches).toContain('https://x.com/*');
  });

  test('All required files should exist', async () => {
    const fs = require('fs');
    const path = require('path');
    
    const requiredFiles = [
      'manifest.json',
      'content.js',
      'options.html',
      'options.js',
      'popup.html',
      'popup.js'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, '../../extension-root', file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  test('HTML files should have proper structure', async () => {
    const fs = require('fs');
    const path = require('path');
    
    // options.html の確認
    const optionsPath = path.join(__dirname, '../../extension-root/options.html');
    const optionsContent = fs.readFileSync(optionsPath, 'utf8');
    
    expect(optionsContent).toContain('<!DOCTYPE html>');
    expect(optionsContent).toContain('data-i18n="settingsTitle"');
    expect(optionsContent).toContain('id="startSetting"');
    expect(optionsContent).toContain('id="clearSetting"');
    expect(optionsContent).toContain('id="listName"');
    expect(optionsContent).toContain('language-switcher');
    
    // popup.html の確認
    const popupPath = path.join(__dirname, '../../extension-root/popup.html');
    const popupContent = fs.readFileSync(popupPath, 'utf8');
    
    expect(popupContent).toContain('<!DOCTYPE html>');
    expect(popupContent).toContain('data-i18n="extensionName"');
    expect(popupContent).toContain('id="currentList"');
    expect(popupContent).toContain('id="openOptions"');
    expect(popupContent).toContain('id="openX"');
  });

  test('JavaScript files should not have syntax errors', async () => {
    const fs = require('fs');
    const path = require('path');
    const vm = require('vm');
    
    const jsFiles = ['content.js', 'options.js', 'popup.js'];
    
    for (const file of jsFiles) {
      const filePath = path.join(__dirname, '../../extension-root', file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Chrome API のモック
      const mockChrome = {
        storage: {
          sync: {
            get: () => {},
            set: () => {},
            clear: () => {}
          },
          onChanged: {
            addListener: () => {}
          }
        },
        runtime: {
          openOptionsPage: () => {}
        },
        tabs: {
          create: () => {}
        }
      };
      
      // 構文エラーがないことを確認
      expect(() => {
        const script = new vm.Script(content);
      }).not.toThrow();
    }
  });
});