
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
