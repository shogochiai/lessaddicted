// Chrome API モック
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) => {
        if (typeof keys === 'function') {
          callback = keys;
          keys = null;
        }
        callback({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      }),
      clear: jest.fn((callback) => {
        if (callback) callback();
      })
    },
    onChanged: {
      addListener: jest.fn()
    }
  },
  runtime: {
    openOptionsPage: jest.fn()
  },
  tabs: {
    create: jest.fn()
  }
};

// DOM API の拡張
global.alert = jest.fn();

// console のモック（必要に応じて）
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};