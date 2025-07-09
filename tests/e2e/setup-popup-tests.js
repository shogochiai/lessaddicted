const fs = require('fs');
const path = require('path');

// Ensure test results directory exists
const testResultsDir = path.join(process.cwd(), 'logs', 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
  console.log('Created test results directory:', testResultsDir);
}

// Create a test runner script
const runTests = `
#!/bin/bash

echo "Running LessAddicted Extension Popup Tests..."
echo "=================================="

# Ensure logs directory exists
mkdir -p logs/test-results

# Run the popup tests
npx playwright test popup.spec.js --project=chromium

echo ""
echo "Tests completed!"
echo "Screenshots saved in: logs/test-results/"
echo "HTML Report available at: logs/playwright-report/index.html"
`;

fs.writeFileSync('run-popup-tests.sh', runTests);
fs.chmodSync('run-popup-tests.sh', '755');
console.log('Created test runner script: run-popup-tests.sh');