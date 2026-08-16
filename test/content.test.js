const test = require('node:test');
const assert = require('node:assert/strict');
const content = require('../content.js');

test('PROVIDERS contains all 8 target LLM providers with valid hosts and selectors', () => {
  assert.equal(content.PROVIDERS.length, 8);
  const providerIds = content.PROVIDERS.map(p => p.id);
  assert.deepEqual(providerIds, ['claude', 'chatgpt', 'gemini', 'grok', 'mistral', 'qwen', 'meta', 'deepseek']);

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
    { host: 'chat.deepseek.com', expected: 'deepseek' },
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

test('isToolbarEnabledForSite combines global and per-site visibility settings', () => {
  const grok = content.PROVIDERS.find((provider) => provider.id === 'grok');
  const chatgpt = content.PROVIDERS.find((provider) => provider.id === 'chatgpt');
  const siteEnabled = { grok: false, chatgpt: true };

  assert.equal(content.isToolbarEnabledForSite(true, siteEnabled, grok), false);
  assert.equal(content.isToolbarEnabledForSite(true, siteEnabled, chatgpt), true);
  assert.equal(content.isToolbarEnabledForSite(true, {}, grok), true);
  assert.equal(content.isToolbarEnabledForSite(false, siteEnabled, chatgpt), false);
});

test('DEFAULT_PROFILES keeps the original General, Developer, Writer, and Quiz profiles configured', () => {
  assert.ok(content.DEFAULT_PROFILES.general);
  assert.ok(content.DEFAULT_PROFILES.developer);
  assert.ok(content.DEFAULT_PROFILES.writing);
  assert.ok(content.DEFAULT_PROFILES.quiz);

  const generalReplies = content.DEFAULT_PROFILES.general.quickReplies;
  assert.equal(generalReplies.length, 6);
  assert.equal(generalReplies[0].label, 'Yes');
  assert.equal(generalReplies[5].label, 'Thanks');

  const devReplies = content.DEFAULT_PROFILES.developer.quickReplies;
  assert.equal(devReplies.length, 6);
  assert.equal(devReplies[0].label, 'Debug');
  assert.equal(devReplies[1].label, 'Optimize');

  const writingReplies = content.DEFAULT_PROFILES.writing.quickReplies;
  assert.equal(writingReplies.length, 6);
  assert.equal(writingReplies[0].label, 'Polish');
  assert.equal(writingReplies[1].label, 'Professional');

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

test('smart question detection reads assistant responses only when enabled', () => {
  const originalDocument = global.document;
  const originalWindow = global.window;
  const assistantMessage = {
    isConnected: true,
    innerText: 'Would you like to continue? Answer Yes or No.',
    textContent: 'Would you like to continue? Answer Yes or No.',
    closest: () => null,
    getBoundingClientRect: () => ({ width: 600, height: 120 })
  };

  global.document = {
    querySelectorAll: (selector) => selector === '[data-message-author-role="assistant"]' ? [assistantMessage] : []
  };
  global.window = {
    getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' })
  };

  assert.deepEqual(content.getSmartRepliesForPage(false), []);
  assert.deepEqual(content.getSmartRepliesForPage(true).map((reply) => reply.text), ['Yes', 'No']);

  global.document = originalDocument;
  global.window = originalWindow;
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

test('getPanelLeft anchors a collapsed toolbar to the chat input', () => {
  const composerRect = { left: 80, width: 840 };
  const inputRect = { left: 112, width: 776 };

  assert.equal(content.getPanelLeft(composerRect, inputRect, 240, true), 112);
  assert.equal(content.getPanelLeft(composerRect, inputRect, 240, false), 380);
});

test('getShortcutIndex only accepts Alt plus a number from 1 to 9', () => {
  assert.equal(content.getShortcutIndex({ altKey: true, code: 'Digit1' }), 0);
  assert.equal(content.getShortcutIndex({ altKey: true, code: 'Digit9' }), 8);
  assert.equal(content.getShortcutIndex({ altKey: false, code: 'Digit1' }), null);
  assert.equal(content.getShortcutIndex({ altKey: true, ctrlKey: true, code: 'Digit1' }), null);
  assert.equal(content.getShortcutIndex({ altKey: true, shiftKey: true, code: 'Digit1' }), null);
  assert.equal(content.getShortcutIndex({ altKey: true, code: 'Digit0' }), null);
  assert.equal(content.getShortcutIndex({ altKey: true, code: 'Numpad1' }), null);
  assert.equal(content.getShortcutIndex({ altKey: true, code: 'Digit1', repeat: true }), null);
  assert.equal(content.getShortcutIndex({ altKey: true, code: 'Digit1', isComposing: true }), null);
});

test('getShortcutReply maps Alt+1 through Alt+9 to the active quick replies', () => {
  const config = {
    quickReplies: [
      { label: 'First', text: 'First prompt' },
      { label: 'Second', text: 'Second prompt' }
    ]
  };

  assert.equal(content.getShortcutReply(config, { altKey: true, code: 'Digit1' }).label, 'First');
  assert.equal(content.getShortcutReply(config, { altKey: true, code: 'Digit2' }).label, 'Second');
  assert.equal(content.getShortcutReply(config, { altKey: true, code: 'Digit3' }), null);
  assert.equal(content.getShortcutReply(config, { code: 'Digit1' }), null);
});

test('command palette backdrop detection only dismisses clicks outside its content box', () => {
  const dialog = {
    getBoundingClientRect: () => ({ left: 100, right: 300, top: 120, bottom: 320 })
  };

  assert.equal(content.isBackdropClick({ target: dialog, clientX: 80, clientY: 180 }, dialog), true);
  assert.equal(content.isBackdropClick({ target: dialog, clientX: 140, clientY: 180 }, dialog), false);
  assert.equal(content.isBackdropClick({ target: {}, clientX: 80, clientY: 180 }, dialog), false);
});

test('toolbar positions are persisted independently for each provider', async () => {
  const originalChrome = global.chrome;
  const originalLocation = global.location;
  let stored = {
    toolbarPositions: {
      chatgpt: { left: 100, top: 200 }
    }
  };

  global.location = { hostname: 'grok.com' };
  global.chrome = {
    storage: {
      local: {
        get: (defaults, callback) => callback({ ...defaults, ...stored }),
        set: (values, callback) => {
          stored = { ...stored, ...values };
          callback?.();
        }
      }
    }
  };

  await content.saveToolbarPosition({ left: 320, top: 480 });
  assert.deepEqual(stored.toolbarPositions, {
    chatgpt: { left: 100, top: 200 },
    grok: { left: 320, top: 480 }
  });
  assert.deepEqual(await content.loadToolbarPosition(), { left: 320, top: 480 });

  global.location = { hostname: 'chatgpt.com' };
  assert.deepEqual(await content.loadToolbarPosition(), { left: 100, top: 200 });

  await content.clearToolbarPosition();
  assert.deepEqual(stored.toolbarPositions, {
    grok: { left: 320, top: 480 }
  });

  global.chrome = originalChrome;
  global.location = originalLocation;
});

test('invalid stored toolbar coordinates are ignored', () => {
  const positions = {
    chatgpt: { left: '100', top: 200 },
    claude: { left: 120, top: Number.NaN }
  };

  assert.equal(content.getStoredSitePosition(positions, 'chatgpt'), null);
  assert.equal(content.getStoredSitePosition(positions, 'claude'), null);
  assert.equal(content.getStoredSitePosition(positions, 'missing'), null);
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
        attributes: {},
        listeners: {},
        setAttribute: (name, value) => { el.attributes[name] = value; },
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
  assert.equal(toolbar.children.length, 6);
  assert.equal(toolbar.children[0].textContent, '⠿');
  assert.ok(toolbar.children[0].className.includes('cqr-drag-handle'));
  assert.equal(toolbar.children[1].textContent, '👍 Yes');
  assert.equal(toolbar.children[1].title, 'Yes (Alt+1) — hold for: Yes, but explain why.');
  assert.equal(toolbar.children[1].attributes['aria-keyshortcuts'], 'Alt+1');
  assert.ok(toolbar.children[1].listeners.mousedown, 'long-press buttons listen for mouse down');
  assert.ok(toolbar.children[1].listeners.mouseleave, 'long-press buttons cancel when the pointer leaves');
  assert.equal(toolbar.children[2].textContent, '👎 No');
  assert.equal(toolbar.children[2].title, 'No (Alt+2) — hold for: No, but explain why.');
  assert.equal(toolbar.children[2].attributes['aria-keyshortcuts'], 'Alt+2');
  assert.equal(toolbar.children[3].textContent, '⌕');
  assert.ok(toolbar.children[3].className.includes('cqr-command-btn'));
  assert.equal(toolbar.children[3].title, 'Search quick replies (Alt+P)');
  assert.equal(toolbar.children[3].attributes['aria-keyshortcuts'], 'Alt+P');
  assert.equal(toolbar.children[4].textContent, '✕');
  assert.ok(toolbar.children[4].className.includes('cqr-toggle-btn'));
  assert.equal(toolbar.children[5].textContent, '↺');
  assert.ok(toolbar.children[5].className.includes('cqr-reset-btn'));

  // Test toggle button click collapses the toolbar
  toolbar.children[4].listeners.click({ preventDefault: () => {} });
  assert.equal(toolbar.children[4].textContent, '💬 Quick Replies');
  assert.ok(toolbar.className.includes('cqr-collapsed'));

  // Test clicking reset button
  toolbar.children[5].listeners.click({ preventDefault: () => {} });

  // Test clicking again re-expands the toolbar
  toolbar.children[4].listeners.click({ preventDefault: () => {} });
  assert.equal(toolbar.children[4].textContent, '✕');
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
            autoSend: true,
            smartQuestionDetection: true,
            toolbarEnabled: false
          });
        }
      }
    }
  };

  const cfg = await content.loadConfig();
  assert.equal(cfg.autoSend, true);
  assert.equal(cfg.smartQuestionDetection, true);
  assert.equal(cfg.toolbarEnabled, false);
  assert.equal(cfg.quickReplies.length, 5);
  assert.equal(cfg.quickReplies[0].label, 'A');

  global.chrome = origChrome;
});

test('loadConfig applies the visibility setting for the current provider', async () => {
  const originalChrome = global.chrome;
  const originalLocation = global.location;
  global.location = { hostname: 'grok.com' };
  global.chrome = {
    storage: {
      sync: {
        get: (defaults, callback) => callback({
          ...defaults,
          profiles: content.DEFAULT_PROFILES,
          toolbarEnabled: true,
          siteEnabled: { grok: false, chatgpt: true }
        })
      }
    }
  };

  const config = await content.loadConfig();
  assert.equal(config.toolbarEnabled, false);

  global.chrome = originalChrome;
  global.location = originalLocation;
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
            autoSend: false,
            toolbarEnabled: true
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
