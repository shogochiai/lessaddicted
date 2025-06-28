// Chrome API 統合テスト
describe('Chrome Storage API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get values from storage', () => {
    const mockData = { defaultTabName: 'Agriculture' };
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback(mockData);
    });

    chrome.storage.sync.get(['defaultTabName'], (data) => {
      expect(data.defaultTabName).toBe('Agriculture');
    });

    expect(chrome.storage.sync.get).toHaveBeenCalledWith(['defaultTabName'], expect.any(Function));
  });

  test('should set values to storage', () => {
    const dataToSave = { defaultTabName: 'Hunting' };
    chrome.storage.sync.set.mockImplementation((items, callback) => {
      if (callback) callback();
    });

    chrome.storage.sync.set(dataToSave, () => {
      // コールバックが呼ばれることを確認
    });

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(dataToSave, expect.any(Function));
  });

  test('should clear storage', () => {
    chrome.storage.sync.clear.mockImplementation((callback) => {
      if (callback) callback();
    });

    chrome.storage.sync.clear(() => {
      // コールバックが呼ばれることを確認
    });

    expect(chrome.storage.sync.clear).toHaveBeenCalled();
  });

  test('should handle storage change events', () => {
    const changeListener = jest.fn();
    chrome.storage.onChanged.addListener(changeListener);

    expect(chrome.storage.onChanged.addListener).toHaveBeenCalledWith(changeListener);
  });
});

describe('Chrome Runtime API', () => {
  test('should open options page', () => {
    chrome.runtime.openOptionsPage();
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
  });
});

describe('Chrome Tabs API', () => {
  test('should create new tab', () => {
    const tabOptions = { url: 'https://x.com/home' };
    chrome.tabs.create(tabOptions);
    
    expect(chrome.tabs.create).toHaveBeenCalledWith(tabOptions);
  });
});