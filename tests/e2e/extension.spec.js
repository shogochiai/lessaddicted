const { test, expect } = require('@playwright/test');

test.describe('LessAddicted Extension Tests', () => {
  test('Extension structure validation', async () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check manifest.json
    const manifestPath = path.join(__dirname, '../../extension-root/manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe('__MSG_extensionName__');
    expect(manifest.default_locale).toBe('en');
    
    // Check locale files
    const enMessages = path.join(__dirname, '../../extension-root/_locales/en/messages.json');
    const jaMessages = path.join(__dirname, '../../extension-root/_locales/ja/messages.json');
    
    expect(fs.existsSync(enMessages)).toBe(true);
    expect(fs.existsSync(jaMessages)).toBe(true);
    
    // Check i18n.js exists
    const i18nPath = path.join(__dirname, '../../extension-root/i18n.js');
    expect(fs.existsSync(i18nPath)).toBe(true);
  });

  test('All required files exist', async () => {
    const fs = require('fs');
    const path = require('path');
    
    const requiredFiles = [
      'manifest.json',
      'content.js',
      'options.html',
      'options.js',
      'popup.html',
      'popup.js',
      'i18n.js',
      '_locales/en/messages.json',
      '_locales/ja/messages.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, '../../extension-root', file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  test('i18n implementation', async () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check HTML files have data-i18n attributes
    const optionsHtml = fs.readFileSync(path.join(__dirname, '../../extension-root/options.html'), 'utf8');
    const popupHtml = fs.readFileSync(path.join(__dirname, '../../extension-root/popup.html'), 'utf8');
    
    expect(optionsHtml).toContain('data-i18n=');
    expect(popupHtml).toContain('data-i18n=');
    
    // Check language switcher exists
    expect(optionsHtml).toContain('language-switcher');
    expect(optionsHtml).toContain('data-lang="en"');
    expect(optionsHtml).toContain('data-lang="ja"');
  });

  test('Disclaimer presence', async () => {
    const fs = require('fs');
    const path = require('path');
    
    const optionsHtml = fs.readFileSync(path.join(__dirname, '../../extension-root/options.html'), 'utf8');
    
    expect(optionsHtml).toContain('disclaimer');
    expect(optionsHtml).toContain('https://github.com/shogochiai/lessaddicted');
  });
});