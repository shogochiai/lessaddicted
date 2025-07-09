// i18n helper functions
const i18n = {
  // Get current language from storage or browser default
  getCurrentLanguage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('language', (data) => {
        if (data.language) {
          resolve(data.language);
        } else {
          // Use browser language, fallback to English
          const browserLang = chrome.i18n.getUILanguage();
          const lang = browserLang.startsWith('ja') ? 'ja' : 'en';
          resolve(lang);
        }
      });
    });
  },

  // Set language preference
  setLanguage(lang) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ language: lang }, resolve);
    });
  },

  // Get translated message
  getMessage(key, substitutions) {
    return chrome.i18n.getMessage(key, substitutions) || key;
  },

  // Update all elements with data-i18n attribute
  updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const message = this.getMessage(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
        element.value = message;
      } else {
        element.textContent = message;
      }
    });

    // Update document title if it has data-i18n
    const titleElement = document.querySelector('title[data-i18n]');
    if (titleElement) {
      const key = titleElement.getAttribute('data-i18n');
      document.title = this.getMessage(key);
    }
  },

  // Initialize language on page load
  async init() {
    const currentLang = await this.getCurrentLanguage();
    
    // Update active language button
    document.querySelectorAll('.language-switcher button').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });

    // Set up language switcher
    document.querySelectorAll('.language-switcher button').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const newLang = e.target.getAttribute('data-lang');
        await this.setLanguage(newLang);
        
        // Update active state
        document.querySelectorAll('.language-switcher button').forEach(b => {
          b.classList.toggle('active', b === e.target);
        });
        
        // Reload page to apply new language
        window.location.reload();
      });
    });

    this.updatePageLanguage();
  }
};

// Initialize i18n when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
  i18n.init();
}

// Export for use in other scripts
window.i18n = i18n;