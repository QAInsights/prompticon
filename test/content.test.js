const test = require('node:test');
const assert = require('node:assert/strict');
const content = require('../content.js');

test('PROVIDERS contains all 7 target LLM providers with valid hosts and selectors', () => {
  assert.equal(content.PROVIDERS.length, 7);
  const providerIds = content.PROVIDERS.map(p => p.id);
  assert.deepEqual(providerIds, ['claude', 'chatgpt', 'gemini', 'grok', 'mistral', 'qwen', 'meta']);

  content.PROVIDERS.forEach(p => {
    assert.ok(p.hosts.length > 0, `Provider ${p.id} should have hosts`);
    assert.ok(p.inputSelectors.length > 0, `Provider ${p.id} should have input selectors`);
    assert.ok(p.sendSelectors.length > 0, `Provider ${p.id} should have send selectors`);
  });
});

test('getProvider matches hostnames accurately', () => {
  const originalLocation = global.location;

  const testCases = [
    { host: 'claude.ai', expected: 'claude' },
    { host: 'www.claude.ai', expected: 'claude' },
    { host: 'chatgpt.com', expected: 'chatgpt' },
    { host: 'chat.openai.com', expected: 'chatgpt' },
    { host: 'gemini.google.com', expected: 'gemini' },
    { host: 'grok.com', expected: 'grok' },
    { host: 'www.grok.com', expected: 'grok' },
    { host: 'chat.mistral.ai', expected: 'mistral' },
    { host: 'chat.qwen.ai', expected: 'qwen' },
    { host: 'meta.ai', expected: 'meta' },
    { host: 'unknown-domain.com', expected: null }
  ];

  testCases.forEach(({ host, expected }) => {
    global.location = { hostname: host };
    const p = content.getProvider();
    if (expected === null) {
      assert.equal(p, null, `Host ${host} should map to null`);
    } else {
      assert.ok(p, `Host ${host} should return a provider`);
      assert.equal(p.id, expected, `Host ${host} should map to provider ${expected}`);
    }
  });

  global.location = originalLocation;
});

test('DEFAULT_PROFILES has General and Quiz profiles configured', () => {
  assert.ok(content.DEFAULT_PROFILES.general);
  assert.ok(content.DEFAULT_PROFILES.quiz);

  const generalReplies = content.DEFAULT_PROFILES.general.quickReplies;
  assert.equal(generalReplies.length, 6);
  assert.equal(generalReplies[0].label, 'Yes');
  assert.equal(generalReplies[5].label, 'Thanks');

  const quizReplies = content.DEFAULT_PROFILES.quiz.quickReplies;
  assert.equal(quizReplies.length, 5);
  assert.deepEqual(quizReplies.map(q => q.label), ['A', 'B', 'C', 'D', 'E']);
});

test('parseRgb correctly parses rgb and rgba strings', () => {
  assert.deepEqual(content.parseRgb('rgb(255, 255, 255)'), { r: 255, g: 255, b: 255 });
  assert.deepEqual(content.parseRgb('rgba(30, 30, 34, 0.75)'), { r: 30, g: 30, b: 34 });
  assert.equal(content.parseRgb('invalid'), null);
  assert.equal(content.parseRgb('transparent'), null);
});

test('getLuminance calculates accurate relative luminance', () => {
  const whiteLum = content.getLuminance({ r: 255, g: 255, b: 255 });
  const blackLum = content.getLuminance({ r: 0, g: 0, b: 0 });

  assert.ok(Math.abs(whiteLum - 1) < 0.001, 'White luminance should be approximately 1');
  assert.equal(blackLum, 0);
  assert.equal(content.getLuminance(null), 1);
});

test('isTransparentColor detects transparent colors accurately', () => {
  assert.equal(content.isTransparentColor('transparent'), true);
  assert.equal(content.isTransparentColor('rgba(0, 0, 0, 0)'), true);
  assert.equal(content.isTransparentColor('rgba(255, 255, 255, 0)'), true);
  assert.equal(content.isTransparentColor('rgb(255, 255, 255)'), false);
  assert.equal(content.isTransparentColor('rgba(255, 255, 255, 1)'), false);
});

test('isModalOpenOnPage detects dialogs and popups', () => {
  const mockElements = [];

  global.document = {
    querySelectorAll: (selector) => {
      if (selector.includes('role="dialog"')) {
        return mockElements;
      }
      return [];
    }
  };

  // 1. No modals on page
  assert.equal(content.isModalOpenOnPage(), false);

  // 2. Visible modal dialog present
  mockElements.push({
    isConnected: true,
    getBoundingClientRect: () => ({ width: 400, height: 300 })
  });

  global.window = {
    getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' })
  };

  assert.equal(content.isModalOpenOnPage(), true);
});

test('scoreInput ranks contenteditable and form inputs accurately', () => {
  const dummyEl = {
    tagName: 'DIV',
    isContentEditable: true,
    closest: (sel) => sel.includes('form') ? true : null,
    getAttribute: (attr) => attr === 'placeholder' ? 'Ask anything' : null,
    id: 'prompt-textarea',
    className: 'composer-textarea',
    getBoundingClientRect: () => ({ top: 600 }),
    offsetTop: 600
  };

  const score = content.scoreInput(dummyEl);
  assert.ok(score >= 200, `Input score should be >= 200, got ${score}`);
});

test('getComposerContainer returns null for empty or null inputs', () => {
  assert.equal(content.getComposerContainer(null), null);
});

test('buildToolbar creates buttons for each quick reply and collapse button', () => {
  global.document = {
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        className: '',
        children: [],
        type: '',
        textContent: '',
        title: '',
        listeners: {},
        setAttribute: () => {},
        classList: {
          toggle: (cls, val) => {
            if (val) el.className += ' ' + cls;
            else el.className = el.className.replace(cls, '').trim();
          }
        },
        addEventListener: (event, handler) => { el.listeners[event] = handler; },
        appendChild: (child) => { el.children.push(child); }
      };
      return el;
    }
  };

  const config = {
    quickReplies: [
      { emoji: '👍', label: 'Yes', text: 'Yes' },
      { emoji: '👎', label: 'No', text: 'No' }
    ],
    autoSend: false
  };

  const toolbar = content.buildToolbar(config);
  assert.ok(toolbar.className.includes('cqr-toolbar'));
  assert.equal(toolbar.children.length, 5);
  assert.equal(toolbar.children[0].textContent, '⠿');
  assert.ok(toolbar.children[0].className.includes('cqr-drag-handle'));
  assert.equal(toolbar.children[1].textContent, '👍 Yes');
  assert.equal(toolbar.children[1].title, 'Yes');
  assert.equal(toolbar.children[2].textContent, '👎 No');
  assert.equal(toolbar.children[2].title, 'No');
  assert.equal(toolbar.children[3].textContent, '✕');
  assert.ok(toolbar.children[3].className.includes('cqr-toggle-btn'));
  assert.equal(toolbar.children[4].textContent, '↺');
  assert.ok(toolbar.children[4].className.includes('cqr-reset-btn'));

  // Test toggle button click collapses the toolbar
  toolbar.children[3].listeners.click({ preventDefault: () => {} });
  assert.equal(toolbar.children[3].textContent, '💬 Quick Replies');
  assert.ok(toolbar.className.includes('cqr-collapsed'));

  // Test clicking reset button
  toolbar.children[4].listeners.click({ preventDefault: () => {} });

  // Test clicking again re-expands the toolbar
  toolbar.children[3].listeners.click({ preventDefault: () => {} });
  assert.equal(toolbar.children[3].textContent, '✕');
  assert.ok(!toolbar.className.includes('cqr-collapsed'));
});

test('loadConfig retrieves configuration from chrome.storage.sync', async () => {
  const origChrome = global.chrome;
  global.chrome = {
    storage: {
      sync: {
        get: (defaults, cb) => {
          cb({
            activeProfile: 'quiz',
            profiles: content.DEFAULT_PROFILES,
            autoSend: true
          });
        }
      }
    }
  };

  const cfg = await content.loadConfig();
  assert.equal(cfg.autoSend, true);
  assert.equal(cfg.quickReplies.length, 5);
  assert.equal(cfg.quickReplies[0].label, 'A');

  global.chrome = origChrome;
});

test('initPanel initializes toolbar element and appends to document body', async () => {
  const bodyChildren = [];
  const origChrome = global.chrome;
  const origDoc = global.document;

  global.chrome = {
    storage: {
      sync: {
        get: (defaults, cb) => {
          cb({
            activeProfile: 'general',
            profiles: content.DEFAULT_PROFILES,
            autoSend: false
          });
        }
      }
    }
  };

  global.document = {
    body: {
      appendChild: (el) => bodyChildren.push(el)
    },
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      className: '',
      children: [],
      listeners: {},
      setAttribute: () => {},
      style: { setProperty: () => {}, removeProperty: () => {} },
      classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
      addEventListener: () => {},
      appendChild: () => {}
    }),
    querySelectorAll: () => []
  };

  await content.initPanel();
  assert.equal(bodyChildren.length, 1);
  assert.equal(bodyChildren[0].className, 'cqr-toolbar');

  global.chrome = origChrome;
  global.document = origDoc;
});

test('setupDraggable handles pointer dragging and updates position', () => {
  const listeners = {};
  const mockEl = {
    listeners: {},
    classList: {
      add: (cls) => { mockEl.className += ' ' + cls; },
      remove: (cls) => { mockEl.className = mockEl.className.replace(cls, '').trim(); }
    },
    className: 'cqr-toolbar',
    style: {},
    offsetWidth: 120,
    offsetHeight: 32,
    getBoundingClientRect: () => ({ left: 100, top: 200 }),
    addEventListener: (evt, handler) => { mockEl.listeners[evt] = handler; }
  };

  const origWin = global.window;
  const winListeners = {};
  global.window = {
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: (evt, handler) => { winListeners[evt] = handler; },
    removeEventListener: (evt) => { delete winListeners[evt]; }
  };

  content.setupDraggable(mockEl);
  assert.ok(mockEl.listeners.pointerdown, 'pointerdown listener should be registered');

  // Trigger pointerdown
  mockEl.listeners.pointerdown({ button: 0, clientX: 100, clientY: 200, pointerId: 1 });
  assert.ok(winListeners.pointermove, 'pointermove listener should be registered on window');

  // Trigger pointermove by 50px right, 30px down
  winListeners.pointermove({ clientX: 150, clientY: 230 });
  assert.equal(mockEl.style.left, '150px');
  assert.equal(mockEl.style.top, '230px');
  assert.ok(mockEl.className.includes('cqr-dragging'));

  // Trigger pointerup
  winListeners.pointerup();
  assert.ok(!mockEl.className.includes('cqr-dragging'));

  global.window = origWin;
});

test('resetPosition clears custom coordinates without errors', () => {
  content.resetPosition();
  assert.ok(true, 'resetPosition should execute cleanly');
});



