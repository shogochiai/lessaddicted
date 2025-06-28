# LessAddicted - Chrome Extension for X.com

## Overview
LessAddicted is a Chrome extension that allows you to set any custom list on X.com (formerly Twitter) as your default view. This helps you consume content more intentionally by automatically displaying your chosen list instead of the algorithmic "For you" feed when you visit X.com.

## Features
- Set any custom list as your default view on X.com
- Automatically switches to your chosen list when visiting X.com
- Simple one-click setup process
- Supports multiple languages (English and Japanese)
- No data collection or tracking
- Open source and transparent

## Installation

### From Source
1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extension-root` directory
5. The LessAddicted icon will appear in your Chrome toolbar

### Usage
1. Click the LessAddicted extension icon in your toolbar
2. Click "Open Settings" 
3. Click "Start Setup" - this will open X.com
4. Click on the custom list tab you want as your default (at the top of the home page)
5. You'll see a confirmation that your default list has been set
6. From now on, when you visit X.com, it will automatically switch to your chosen list

## Configuration
- **Clear Settings**: Remove your current default list setting
- **Language Switch**: Toggle between English and Japanese in the settings page

## Privacy & Security
LessAddicted is an unofficial third-party tool for X.com. Its sole purpose is to automate the action of making a list tab your default view. It:
- Does NOT collect any personal data
- Does NOT modify any content
- Does NOT communicate with external servers
- Only stores your list preference locally in Chrome

Source code is available at: https://github.com/shogochiai/lessaddicted

## Development

### Project Structure
```
extension-root/
├── manifest.json       # Extension configuration
├── content.js          # Script that runs on X.com pages
├── options.html        # Settings page UI
├── options.js          # Settings page logic
├── popup.html          # Extension popup UI
├── popup.js            # Extension popup logic
├── i18n.js            # Internationalization helper
└── _locales/          # Translation files
    ├── en/            # English translations
    └── ja/            # Japanese translations
```

### Testing
```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

### Building
No build process required - the extension runs directly from source.

## Contributing
Pull requests are welcome! Please feel free to submit issues or PRs.

## License
MIT License - see LICENSE file for details

## Disclaimer
This is an unofficial tool and is not affiliated with X.com or Twitter. Use at your own risk.