const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

test.describe('Extension Smoke Test', () => {
  test('should load extension successfully', async () => {
    // Launch Chrome with extension
    const extensionPath = path.join(process.cwd(), 'extension-root');
    const browser = await chromium.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to extensions page
    await page.goto('chrome://extensions/');
    
    // Enable developer mode
    const devModeToggle = await page.locator('#devMode').locator('input[type="checkbox"]');
    if (!(await devModeToggle.isChecked())) {
      await devModeToggle.click();
    }
    
    // Look for the extension
    const extensionCards = await page.locator('extensions-item').all();
    let extensionFound = false;
    let extensionId = '';
    
    for (const card of extensionCards) {
      const nameElement = await card.locator('#name-and-version').locator('#name');
      const name = await nameElement.textContent();
      if (name && name.includes('LessAddicted')) {
        extensionFound = true;
        const idElement = await card.locator('#extension-id');
        extensionId = await idElement.textContent();
        extensionId = extensionId.replace('ID: ', '').trim();
        break;
      }
    }
    
    expect(extensionFound).toBe(true);
    console.log('Extension loaded successfully with ID:', extensionId);
    
    // Try to open the popup
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForLoadState('domcontentloaded');
    
    // Check that popup loaded
    const title = await page.title();
    expect(title).toBe('LessAddicted');
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'logs/test-results/extension-loaded.png',
      fullPage: true 
    });
    
    await browser.close();
  });
});