const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

// Helper function to get extension ID
async function getExtensionId(page) {
  await page.goto('chrome://extensions/');
  
  // Enable developer mode if not already enabled
  const devModeToggle = await page.locator('#devMode').locator('input[type="checkbox"]');
  if (!(await devModeToggle.isChecked())) {
    await devModeToggle.click();
  }
  
  // Get the extension ID from the page
  const extensionCards = await page.locator('extensions-item').all();
  for (const card of extensionCards) {
    const nameElement = await card.locator('#name-and-version').locator('#name');
    const name = await nameElement.textContent();
    if (name && name.includes('LessAddicted')) {
      const idElement = await card.locator('#extension-id');
      const extensionId = await idElement.textContent();
      return extensionId.replace('ID: ', '').trim();
    }
  }
  throw new Error('Extension not found');
}

test.describe('LessAddicted Extension Popup Tests', () => {
  let browser;
  let context;
  let page;
  let extensionId;

  test.beforeAll(async () => {
    // Launch Chrome with extension
    const extensionPath = path.join(process.cwd(), 'extension-root');
    browser = await chromium.launch({
      headless: false, // Extensions don't work in headless mode
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });
    
    context = await browser.newContext();
    page = await context.newPage();
    
    // Get extension ID
    extensionId = await getExtensionId(page);
    console.log('Extension ID:', extensionId);
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test.beforeEach(async () => {
    // Clear extension storage before each test
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.evaluate(() => {
      chrome.storage.sync.clear();
    });
    await page.reload();
  });

  test('should display no list state initially', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Wait for loading to complete
    await page.waitForSelector('#loadingState', { state: 'hidden' });
    
    // Check no list state is active
    const noListState = await page.locator('#noListState');
    await expect(noListState).toHaveClass(/active/);
    
    // Check elements are visible
    await expect(page.locator('.no-list-icon')).toBeVisible();
    await expect(page.locator('.no-list-text')).toContainText('No default list selected');
    await expect(page.locator('#startSetup')).toContainText('Choose Default List');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'logs/test-results/popup-no-list-state.png',
      fullPage: true 
    });
  });

  test('should switch to choosing list state when clicking start setup', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Wait for no list state
    await page.waitForSelector('#noListState.active');
    
    // Click start setup button
    await page.click('#startSetup');
    
    // Wait for choosing list state
    await page.waitForSelector('#chooseListState.active');
    
    // Check elements are visible
    await expect(page.locator('.setup-instructions')).toBeVisible();
    await expect(page.locator('.setup-instructions')).toContainText('Please go to X and click on the list tab');
    await expect(page.locator('.status-text')).toContainText('Waiting for list selection...');
    await expect(page.locator('#cancelSetup')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: 'logs/test-results/popup-choosing-list-state.png',
      fullPage: true 
    });
  });

  test('should cancel setup and return to no list state', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Navigate to choosing list state
    await page.waitForSelector('#noListState.active');
    await page.click('#startSetup');
    await page.waitForSelector('#chooseListState.active');
    
    // Click cancel
    await page.click('#cancelSetup');
    
    // Should return to no list state
    await page.waitForSelector('#noListState.active');
    await expect(page.locator('#chooseListState')).not.toHaveClass(/active/);
  });

  test('should display list selected state with mock data', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Set mock data in storage
    await page.evaluate(() => {
      chrome.storage.sync.set({ 
        defaultTabName: 'My Test List',
        defaultListUrl: 'https://x.com/lists/12345'
      });
    });
    
    // Reload to apply changes
    await page.reload();
    await page.waitForSelector('#loadingState', { state: 'hidden' });
    
    // Check list selected state is active
    await expect(page.locator('#listSelectedState')).toHaveClass(/active/);
    
    // Check list name is displayed
    await expect(page.locator('#selectedListName')).toContainText('My Test List');
    
    // Check buttons are visible
    await expect(page.locator('#updateList')).toBeVisible();
    await expect(page.locator('#deleteList')).toBeVisible();
    await expect(page.locator('#openXWithList')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: 'logs/test-results/popup-list-selected-state.png',
      fullPage: true 
    });
  });

  test('should toggle language between EN and JA', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForSelector('#loadingState', { state: 'hidden' });
    
    // Check initial language is EN
    const languageToggle = page.locator('#languageToggle');
    await expect(languageToggle).toContainText('EN');
    
    // Click to switch to Japanese
    await languageToggle.click();
    await expect(languageToggle).toContainText('JA');
    
    // Check some text changed to Japanese
    await expect(page.locator('.no-list-text')).toContainText('デフォルトリストが選択されていません');
    await expect(page.locator('#startSetup')).toContainText('デフォルトリストを選択');
    
    // Take screenshot of Japanese UI
    await page.screenshot({ 
      path: 'logs/test-results/popup-japanese-ui.png',
      fullPage: true 
    });
    
    // Click to switch back to English
    await languageToggle.click();
    await expect(languageToggle).toContainText('EN');
    await expect(page.locator('.no-list-text')).toContainText('No default list selected');
  });

  test('should show update functionality', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Set up list selected state
    await page.evaluate(() => {
      chrome.storage.sync.set({ 
        defaultTabName: 'Current List',
        defaultListUrl: 'https://x.com/lists/12345'
      });
    });
    
    await page.reload();
    await page.waitForSelector('#listSelectedState.active');
    
    // Click update button
    await page.click('#updateList');
    
    // Should switch to choosing list state
    await page.waitForSelector('#chooseListState.active');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'logs/test-results/popup-update-list.png',
      fullPage: true 
    });
  });

  test('should show delete confirmation dialog', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Set up list selected state
    await page.evaluate(() => {
      chrome.storage.sync.set({ 
        defaultTabName: 'List to Delete',
        defaultListUrl: 'https://x.com/lists/12345'
      });
    });
    
    await page.reload();
    await page.waitForSelector('#listSelectedState.active');
    
    // Click delete button
    await page.click('#deleteList');
    
    // Check confirmation dialog is visible
    await expect(page.locator('#confirmationDialog')).toHaveClass(/active/);
    await expect(page.locator('.dialog-title')).toContainText('Delete default list?');
    await expect(page.locator('.dialog-message')).toContainText('This will remove your default list setting.');
    
    // Take screenshot of confirmation dialog
    await page.screenshot({ 
      path: 'logs/test-results/popup-delete-confirmation.png',
      fullPage: true 
    });
    
    // Cancel deletion
    await page.click('#cancelDelete');
    await expect(page.locator('#confirmationDialog')).not.toHaveClass(/active/);
    
    // List should still be selected
    await expect(page.locator('#listSelectedState')).toHaveClass(/active/);
  });

  test('should delete list and return to no list state', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Set up list selected state
    await page.evaluate(() => {
      chrome.storage.sync.set({ 
        defaultTabName: 'List to Delete',
        defaultListUrl: 'https://x.com/lists/12345'
      });
    });
    
    await page.reload();
    await page.waitForSelector('#listSelectedState.active');
    
    // Delete the list
    await page.click('#deleteList');
    await page.waitForSelector('#confirmationDialog.active');
    await page.click('#confirmDelete');
    
    // Should return to no list state
    await page.waitForSelector('#noListState.active');
    await expect(page.locator('#confirmationDialog')).not.toHaveClass(/active/);
    
    // Verify storage was cleared
    const storageData = await page.evaluate(() => {
      return new Promise(resolve => {
        chrome.storage.sync.get(['defaultTabName', 'defaultListUrl'], resolve);
      });
    });
    expect(storageData.defaultTabName).toBeUndefined();
    expect(storageData.defaultListUrl).toBeUndefined();
  });

  test('should persist language preference', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForSelector('#loadingState', { state: 'hidden' });
    
    // Switch to Japanese
    await page.click('#languageToggle');
    await expect(page.locator('#languageToggle')).toContainText('JA');
    
    // Reload page
    await page.reload();
    await page.waitForSelector('#loadingState', { state: 'hidden' });
    
    // Language should still be Japanese
    await expect(page.locator('#languageToggle')).toContainText('JA');
    await expect(page.locator('.no-list-text')).toContainText('デフォルトリストが選択されていません');
  });

  test('should handle storage changes in real-time', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForSelector('#noListState.active');
    
    // Simulate list selection from content script
    await page.evaluate(() => {
      chrome.storage.sync.set({ 
        defaultTabName: 'Real-time Updated List',
        isSettingMode: false
      });
    });
    
    // Should automatically switch to list selected state
    await page.waitForSelector('#listSelectedState.active');
    await expect(page.locator('#selectedListName')).toContainText('Real-time Updated List');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'logs/test-results/popup-realtime-update.png',
      fullPage: true 
    });
  });

  test('should open X.com when clicking Open X button', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Set up list selected state
    await page.evaluate(() => {
      chrome.storage.sync.set({ 
        defaultTabName: 'My List',
        defaultListUrl: 'https://x.com/lists/12345'
      });
    });
    
    await page.reload();
    await page.waitForSelector('#listSelectedState.active');
    
    // Listen for new page creation
    const newPagePromise = context.waitForEvent('page');
    
    // Click Open X button
    await page.click('#openXWithList');
    
    // Wait for new tab
    const newPage = await newPagePromise;
    await newPage.waitForLoadState('domcontentloaded');
    
    // Check that X.com was opened
    expect(newPage.url()).toContain('x.com');
    
    await newPage.close();
  });

  test('should capture all UI states in different languages', async () => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Capture all states in English
    await page.waitForSelector('#noListState.active');
    await page.screenshot({ 
      path: 'logs/test-results/all-states-en-1-no-list.png',
      fullPage: true 
    });
    
    await page.click('#startSetup');
    await page.waitForSelector('#chooseListState.active');
    await page.screenshot({ 
      path: 'logs/test-results/all-states-en-2-choosing.png',
      fullPage: true 
    });
    
    await page.evaluate(() => {
      chrome.storage.sync.set({ 
        defaultTabName: 'Tech News',
        defaultListUrl: 'https://x.com/lists/12345',
        isSettingMode: false
      });
    });
    await page.reload();
    await page.waitForSelector('#listSelectedState.active');
    await page.screenshot({ 
      path: 'logs/test-results/all-states-en-3-selected.png',
      fullPage: true 
    });
    
    // Switch to Japanese and capture all states
    await page.click('#languageToggle');
    
    // Clear and go back to no list state
    await page.evaluate(() => {
      chrome.storage.sync.remove(['defaultTabName', 'defaultListUrl']);
    });
    await page.reload();
    await page.waitForSelector('#noListState.active');
    await page.screenshot({ 
      path: 'logs/test-results/all-states-ja-1-no-list.png',
      fullPage: true 
    });
    
    await page.click('#startSetup');
    await page.waitForSelector('#chooseListState.active');
    await page.screenshot({ 
      path: 'logs/test-results/all-states-ja-2-choosing.png',
      fullPage: true 
    });
    
    await page.evaluate(() => {
      chrome.storage.sync.set({ 
        defaultTabName: 'テックニュース',
        defaultListUrl: 'https://x.com/lists/12345',
        isSettingMode: false
      });
    });
    await page.reload();
    await page.waitForSelector('#listSelectedState.active');
    await page.screenshot({ 
      path: 'logs/test-results/all-states-ja-3-selected.png',
      fullPage: true 
    });
  });
});