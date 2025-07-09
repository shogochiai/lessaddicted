# LessAddicted Extension Popup Tests

This directory contains Playwright tests for the LessAddicted Chrome extension popup functionality.

## Test Coverage

The popup tests (`popup.spec.js`) cover the following scenarios:

1. **No List State**
   - Initial state when no default list is selected
   - Display of setup button and messaging

2. **Choosing List State**
   - State when user is selecting a default list
   - Display of instructions and waiting message
   - Cancel functionality

3. **List Selected State**
   - State when a default list is configured
   - Display of list name
   - Update and delete buttons

4. **Language Toggle**
   - Switching between English and Japanese
   - Persistence of language preference
   - UI translation

5. **Update Functionality**
   - Updating the default list
   - Transition from selected to choosing state

6. **Delete Functionality**
   - Confirmation dialog
   - Deletion process
   - Return to no list state

7. **Real-time Updates**
   - Storage change listeners
   - Automatic UI updates

8. **Open X Button**
   - Creating new tab with X.com

## Running the Tests

### Prerequisites
```bash
npm install
```

### Run Tests
```bash
# Run popup tests specifically
npx playwright test popup.spec.js --project=chromium

# Or use the convenience script
node tests/e2e/setup-popup-tests.js
./run-popup-tests.sh
```

### View Results
- Screenshots: `logs/test-results/`
- HTML Report: `npx playwright show-report logs/playwright-report`
- JSON Results: `logs/test-results.json`

## Screenshots Generated

The tests capture screenshots of all states:

### English UI
- `popup-no-list-state.png` - No default list selected
- `popup-choosing-list-state.png` - Waiting for list selection
- `popup-list-selected-state.png` - List configured
- `popup-update-list.png` - Update process
- `popup-delete-confirmation.png` - Delete confirmation dialog

### Japanese UI
- `popup-japanese-ui.png` - Japanese interface
- `all-states-ja-*.png` - All states in Japanese

### Other
- `popup-realtime-update.png` - Real-time storage updates
- `all-states-en-*.png` - All states in English

## Test Structure

```javascript
test.describe('LessAddicted Extension Popup Tests', () => {
  // Setup: Load extension and get extension ID
  // Clear storage before each test
  // Test all popup states and functionality
  // Capture screenshots for visual verification
});
```

## Important Notes

1. **Non-headless Mode**: Chrome extensions require running in non-headless mode
2. **Extension ID**: Tests dynamically retrieve the extension ID from chrome://extensions
3. **Storage Management**: Tests clear chrome.storage.sync before each test for isolation
4. **Real-time Testing**: Tests verify that storage changes trigger UI updates
5. **Language Persistence**: Tests verify language preference is saved

## Debugging

If tests fail:

1. Check that the extension is properly loaded at `extension-root/`
2. Ensure Chrome is not already running
3. Check console output for extension ID
4. View screenshots in `logs/test-results/` for visual debugging
5. Use `--debug` flag to run tests with Playwright Inspector

```bash
npx playwright test popup.spec.js --project=chromium --debug
```