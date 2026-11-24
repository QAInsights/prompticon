const test = require('node:test');
const assert = require('node:assert/strict');
const content = require('../content.js');

test('PROVIDERS contains all 26 target LLM providers with valid hosts and selectors', () => {
  assert.equal(content.PROVIDERS.length, 26);
  const providerIds = content.PROVIDERS.map(p => p.id);
  assert.deepEqual(providerIds, ['claude', 'chatgpt', 'gemini', 'grok', 'mistral', 'qwen', 'meta', 'deepseek', 'copilot', 'devin', 'cursor', 'githubcopilot', 'jules', 'v0', 'bolt', 'lovable', 'replit', 'aistudio', 'groq', 'phind', 'perplexity', 'notebooklm', 'poe', 'lmarena', 'openrouter', 'kimi']);

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
    { host: 'copilot.microsoft.com', expected: 'copilot' },
    { host: 'app.devin.ai', expected: 'devin' },
    { host: 'platform.openai.com', expected: 'chatgpt' },
    { host: 'cursor.com', expected: 'cursor' },
    { host: 'github.com', expected: 'githubcopilot' },
    { host: 'jules.google.com', expected: 'jules' },
    { host: 'v0.dev', expected: 'v0' },
    { host: 'bolt.new', expected: 'bolt' },
    { host: 'lovable.dev', expected: 'lovable' },
    { host: 'replit.com', expected: 'replit' },
    { host: 'aistudio.google.com', expected: 'aistudio' },
    { host: 'groq.com', expected: 'groq' },
    { host: 'phind.com', expected: 'phind' },
    { host: 'perplexity.ai', expected: 'perplexity' },
    { host: 'www.perplexity.ai', expected: 'perplexity' },
    { host: 'notebooklm.google.com', expected: 'notebooklm' },
    { host: 'poe.com', expected: 'poe' },
    { host: 'lmarena.ai', expected: 'lmarena' },
    { host: 'chat.lmsys.org', expected: 'lmarena' },
    { host: 'openrouter.ai', expected: 'openrouter' },
    { host: 'kimi.com', expected: 'kimi' },
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
  const copilot = content.PROVIDERS.find((provider) => provider.id === 'copilot');
  const siteEnabled = { grok: false, chatgpt: true, copilot: false };

  assert.equal(content.isToolbarEnabledForSite(true, siteEnabled, grok), false);
  assert.equal(content.isToolbarEnabledForSite(true, siteEnabled, chatgpt), true);
  assert.equal(content.isToolbarEnabledForSite(true, siteEnabled, copilot), false);
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

test('only trusted browser events can activate injected toolbar controls', () => {
  assert.equal(content.isTrustedUserEvent({ isTrusted: true }), true);
  assert.equal(content.isTrustedUserEvent({ isTrusted: false }), false);
  assert.equal(content.isTrustedUserEvent({}), false);
  assert.equal(content.isTrustedUserEvent(null), false);
});

test('injected toolbar metadata does not expose saved prompt text to the host page', () => {
  const reply = { label: 'Secret', text: 'private prompt content' };

  assert.equal(content.getReplyDisplayLabel(reply), 'Secret');
  assert.equal(content.getReplyDisplayLabel({ label: '  ', text: 'private prompt content' }), 'Untitled reply');
  assert.equal(content.getReplyButtonTitle(reply, { autoSend: false }, 0, true), 'Fill Secret (Alt+1) — hold for expanded reply');
  assert.doesNotMatch(content.getReplyButtonTitle(reply, { autoSend: false }, 0, true), /private prompt content/);
});

test('command palette backdrop detection only dismisses clicks outside its content box', () => {
  const dialog = {
    getBoundingClientRect: () => ({ left: 100, right: 300, top: 120, bottom: 320 })
  };

  assert.equal(content.isBackdropClick({ target: dialog, clientX: 80, clientY: 180 }, dialog), true);
  assert.equal(content.isBackdropClick({ target: dialog, clientX: 140, clientY: 180 }, dialog), false);
  assert.equal(content.isBackdropClick({ target: {}, clientX: 80, clientY: 180 }, dialog), false);
});

test('template dialog ignores the click trailing the gesture that opened it', () => {
  const origDoc = global.document;
  let dialogEl = null;
  const listeners = {};
  const makeEl = (tag) => {
    const el = {
      tagName: tag.toUpperCase(),
      className: '',
      children: [],
      attributes: {},
      elements: {},
      open: false,
      setAttribute(name, value) { el.attributes[name] = value; },
      addEventListener(evt, handler) { listeners[`${tag}:${evt}`] = handler; },
      append(...nodes) { el.children.push(...nodes); },
      appendChild(child) { el.children.push(child); },
      replaceChildren() { el.children = []; },
      focus() {},
      showModal() { el.open = true; },
      close() { el.open = false; listeners[`${tag}:close`]?.(); },
      getBoundingClientRect() { return { left: 100, right: 300, top: 120, bottom: 320 }; }
    };
    return el;
  };
  global.document = {
    querySelectorAll: () => [],
    createElement: (tag) => {
      const el = makeEl(tag);
      if (tag === 'dialog') dialogEl = el;
      if (tag === 'form') el.elements = { name: { focus() {} } };
      return el;
    },
    body: { appendChild: () => {} }
  };

  try {
    const reply = { label: 'Greet', text: 'Hello {{name}}' };
    assert.equal(content.activateQuickReply(reply, { autoSend: false }), true);
    assert.ok(dialogEl, 'template dialog was created');
    assert.equal(dialogEl.open, true);

    // Native closedby="any" would light-dismiss on any outside click, including the
    // click that trails a mouseup activation. No click handler is registered, so the
    // trailing click is inert.
    assert.notEqual(dialogEl.attributes.closedby, 'any');
    assert.equal(listeners['dialog:click'], undefined, 'a trailing click cannot close the dialog');

    // A press that starts inside the dialog (target is a field, or coords inside the
    // dialog box) must not dismiss it — releasing on the backdrop keeps edits.
    listeners['dialog:pointerdown']({ isTrusted: true, target: {}, clientX: 5, clientY: 5 });
    listeners['dialog:pointerdown']({ isTrusted: true, target: dialogEl, clientX: 150, clientY: 150 });
    assert.equal(dialogEl.open, true, 'presses starting inside the dialog did not close it');

    // A genuine backdrop press (target is the dialog, coords outside its box) closes.
    listeners['dialog:pointerdown']({ isTrusted: true, target: dialogEl, clientX: 5, clientY: 5 });
    assert.equal(dialogEl.open, false, 'backdrop press closed the dialog');
  } finally {
    global.document = origDoc;
  }
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
  assert.equal(toolbar.children[1].title, 'Fill Yes (Alt+1) — hold for expanded reply');
  assert.equal(toolbar.children[1].attributes['aria-keyshortcuts'], 'Alt+1');
  assert.ok(toolbar.children[1].listeners.mousedown, 'long-press buttons listen for mouse down');
  assert.ok(toolbar.children[1].listeners.mouseleave, 'long-press buttons cancel when the pointer leaves');
  assert.equal(toolbar.children[2].textContent, '👎 No');
  assert.equal(toolbar.children[2].title, 'Fill No (Alt+2) — hold for expanded reply');
  assert.equal(toolbar.children[2].attributes['aria-keyshortcuts'], 'Alt+2');
  assert.equal(toolbar.children[3].textContent, '⌕');
  assert.ok(toolbar.children[3].className.includes('cqr-command-btn'));
  assert.equal(toolbar.children[3].title, 'Search quick replies (Alt+P)');
  assert.equal(toolbar.children[3].attributes['aria-keyshortcuts'], 'Alt+P');
  assert.equal(toolbar.children[4].textContent, '✕');
  assert.ok(toolbar.children[4].className.includes('cqr-toggle-btn'));
  assert.equal(toolbar.children[5].textContent, '↺');
  assert.ok(toolbar.children[5].className.includes('cqr-reset-btn'));

  // A supported page cannot toggle injected controls with a synthetic click.
  toolbar.children[4].listeners.click({ isTrusted: false, preventDefault: () => {} });
  assert.equal(toolbar.children[4].textContent, '✕');
  assert.ok(!toolbar.className.includes('cqr-collapsed'));

  // Test trusted toggle button click collapses the toolbar.
  toolbar.children[4].listeners.click({ isTrusted: true, preventDefault: () => {} });
  assert.equal(toolbar.children[4].textContent, '💬 Quick Replies');
  assert.ok(toolbar.className.includes('cqr-collapsed'));

  // Test clicking reset button
  toolbar.children[5].listeners.click({ isTrusted: true, preventDefault: () => {} });

  // Test clicking again re-expands the toolbar
  toolbar.children[4].listeners.click({ isTrusted: true, preventDefault: () => {} });
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
  assert.equal(cfg.timeSavedTracking, true);
  assert.equal(cfg.quickReplies.length, 5);
  assert.equal(cfg.quickReplies[0].label, 'A');

  global.chrome = origChrome;
});

test('loadConfig exposes idle fade settings with defaults', async () => {
  const origChrome = global.chrome;
  global.chrome = {
    storage: {
      sync: {
        get: (defaults, cb) => cb({ ...defaults, toolbarFadeSeconds: 10 })
      }
    }
  };

  const cfg = await content.loadConfig();
  assert.equal(cfg.toolbarFadeEnabled, true);
  assert.equal(cfg.toolbarFadeSeconds, 10);

  global.chrome = origChrome;
});

test('normalizeFadeDelay clamps the fade timeout to 1-60 seconds', () => {
  assert.equal(content.normalizeFadeDelay(0), 3);
  assert.equal(content.normalizeFadeDelay(-5), 3);
  assert.equal(content.normalizeFadeDelay('abc'), 3);
  assert.equal(content.normalizeFadeDelay(1), 1);
  assert.equal(content.normalizeFadeDelay(45.6), 46);
  assert.equal(content.normalizeFadeDelay(120), 60);
});

test('setupIdleFade dims after the delay, re-arms on visibility transitions, and wakes on pointer entry', async () => {
  const originalMutationObserver = global.MutationObserver;
  const originalDocument = global.document;
  const observers = [];
  global.MutationObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  };
  global.document = { activeElement: null };

  const classes = new Set(['cqr-toolbar']);
  const bar = {
    listeners: {},
    isConnected: true,
    classList: {
      add: (cls) => classes.add(cls),
      remove: (cls) => classes.delete(cls),
      contains: (cls) => classes.has(cls)
    },
    matches: () => false,
    contains: () => false,
    addEventListener: (event, handler) => { bar.listeners[event] = handler; }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  try {
    content.setupIdleFade(bar, { toolbarFadeEnabled: true, toolbarFadeSeconds: 1 });
    const observer = observers[0];

    // A same-state notification mid-countdown must not move the deadline:
    // the fade still lands about 1s after the toolbar first appeared,
    // not 1s after the latest notification.
    classes.add('cqr-visible');
    observer.callback();
    await sleep(600);
    observer.callback();
    await sleep(600);
    assert.ok(classes.has('cqr-faded'));

    // Hiding then showing the toolbar starts a fresh countdown.
    classes.delete('cqr-visible');
    observer.callback();
    assert.ok(!classes.has('cqr-faded'));
    classes.add('cqr-visible');
    observer.callback();
    await sleep(300);
    assert.ok(!classes.has('cqr-faded'));
    await sleep(900);
    assert.ok(classes.has('cqr-faded'));

    // Pointer entry wakes the toolbar immediately.
    bar.listeners.pointerenter();
    assert.ok(!classes.has('cqr-faded'));

    // A pending timer on a detached toolbar releases the observer without
    // fading: detachment is not a class change, so the timer is the check
    // that actually runs in production.
    bar.listeners.pointerleave();
    bar.isConnected = false;
    await sleep(1200);
    assert.ok(!classes.has('cqr-faded'));
    assert.ok(observer.disconnected);
  } finally {
    global.MutationObserver = originalMutationObserver;
    global.document = originalDocument;
  }
});

test('recordTimeSaved writes local stats only when tracking is enabled', () => {
  const originalChrome = global.chrome;
  let stored = {};
  global.chrome = {
    storage: {
      local: {
        get: (defaults, callback) => callback({ ...defaults, ...stored }),
        set: (values) => { stored = { ...stored, ...values }; }
      }
    }
  };

  content.recordTimeSaved('A quick reply', { timeSavedTracking: true });
  assert.equal(stored.timeSavedStats.uses, 1);
  content.recordTimeSaved('Another reply', { timeSavedTracking: false });
  assert.equal(stored.timeSavedStats.uses, 1);

  global.chrome = originalChrome;
});

test('loadConfig applies the Copilot visibility setting for the current provider', async () => {
  const originalChrome = global.chrome;
  const originalLocation = global.location;
  global.location = { hostname: 'copilot.microsoft.com' };
  global.chrome = {
    storage: {
      sync: {
        get: (defaults, callback) => callback({
          ...defaults,
          profiles: content.DEFAULT_PROFILES,
          toolbarEnabled: true,
          siteEnabled: { copilot: false, chatgpt: true }
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
  mockEl.listeners.pointerdown({ isTrusted: true, button: 0, clientX: 100, clientY: 200, pointerId: 1 });
  assert.ok(winListeners.pointermove, 'pointermove listener should be registered on window');

  // Trigger pointermove by 50px right, 30px down
  winListeners.pointermove({ isTrusted: true, clientX: 150, clientY: 230 });
  assert.equal(mockEl.style.left, '150px');
  assert.equal(mockEl.style.top, '230px');
  assert.ok(mockEl.className.includes('cqr-dragging'));

  // Trigger pointerup
  winListeners.pointerup({ isTrusted: true });
  assert.ok(!mockEl.className.includes('cqr-dragging'));

  global.window = origWin;
});

test('resetPosition clears custom coordinates without errors', () => {
  content.resetPosition();
  assert.ok(true, 'resetPosition should execute cleanly');
});

test('mergeDefaultReplies appends up to 3 defaults after the profile replies', () => {
  const developer = content.DEFAULT_PROFILES.developer.quickReplies;
  const general = content.DEFAULT_PROFILES.general.quickReplies;

  const merged = content.mergeDefaultReplies(developer, general);

  assert.equal(merged.length, developer.length + 3);
  assert.deepEqual(merged.slice(0, developer.length), developer);
  assert.deepEqual(merged.slice(developer.length), general.slice(0, 3));
  assert.equal(content.MAX_INCLUDED_DEFAULT_REPLIES, 3);
});

test('mergeDefaultReplies skips replies the profile already has', () => {
  const general = content.DEFAULT_PROFILES.general.quickReplies;
  const replies = [
    { emoji: '💻', label: 'Debug', text: 'Debug this' },
    { emoji: '👍', label: 'Yes', text: 'Yes' }
  ];

  const merged = content.mergeDefaultReplies(replies, general);
  const texts = merged.map((r) => r.text);

  assert.deepEqual(texts, ['Debug this', 'Yes', 'No', 'Continue', 'Can you go into more detail?']);
  assert.equal(merged.filter((r) => r.text === 'Yes').length, 1);
});

test('loadConfig appends General defaults to a non-General profile when enabled', async () => {
  const origChrome = global.chrome;
  global.chrome = {
    storage: {
      sync: {
        get: (defaults, cb) => {
          cb({
            activeProfile: 'developer',
            profiles: content.DEFAULT_PROFILES,
            autoSend: false,
            toolbarEnabled: true,
            includeDefaultReplies: true
          });
        }
      }
    }
  };

  const cfg = await content.loadConfig();
  const developer = content.DEFAULT_PROFILES.developer.quickReplies;
  const general = content.DEFAULT_PROFILES.general.quickReplies;

  assert.equal(cfg.quickReplies.length, developer.length + 3);
  assert.equal(cfg.quickReplies[0].label, 'Debug');
  assert.deepEqual(
    cfg.quickReplies.slice(developer.length).map((r) => r.label),
    general.slice(0, 3).map((r) => r.label)
  );

  global.chrome = origChrome;
});

test('loadConfig leaves the General profile unchanged when defaults inclusion is enabled', async () => {
  const origChrome = global.chrome;
  global.chrome = {
    storage: {
      sync: {
        get: (defaults, cb) => {
          cb({
            activeProfile: 'general',
            profiles: content.DEFAULT_PROFILES,
            includeDefaultReplies: true,
            toolbarEnabled: true
          });
        }
      }
    }
  };

  const cfg = await content.loadConfig();
  assert.equal(cfg.quickReplies.length, content.DEFAULT_PROFILES.general.quickReplies.length);

  global.chrome = origChrome;
});

test('loadConfig keeps profiles standalone when defaults inclusion is off', async () => {
  const origChrome = global.chrome;
  global.chrome = {
    storage: {
      sync: {
        get: (defaults, cb) => {
          cb({
            activeProfile: 'developer',
            profiles: content.DEFAULT_PROFILES,
            includeDefaultReplies: false,
            toolbarEnabled: true
          });
        }
      }
    }
  };

  const cfg = await content.loadConfig();
  assert.equal(cfg.quickReplies.length, content.DEFAULT_PROFILES.developer.quickReplies.length);

  global.chrome = origChrome;
});

test('setInputText does not duplicate text on Lexical-style editors that handle beforeinput', () => {
  const origDoc = global.document;
  const origWin = global.window;
  const origLoc = global.location;
  const origInputEvent = global.InputEvent;
  const origEvent = global.Event;

  let execCommandCalls = 0;
  const editor = {
    tagName: 'DIV',
    isContentEditable: true,
    isConnected: true,
    id: 'ask-input',
    className: '',
    offsetTop: 300,
    textContent: '',
    closest: () => ({}),
    getAttribute: () => null,
    getBoundingClientRect: () => ({ width: 600, height: 40, top: 300 }),
    focus: () => {},
    querySelector: () => null,
    dispatchEvent: (event) => {
      if (event.type === 'beforeinput' && event.data) {
        editor.textContent += event.data;
        event.defaultPrevented = true;
        return false;
      }
      if (event.type === 'input' && event.data) {
        editor.textContent += event.data;
      }
      return true;
    }
  };

  global.location = { hostname: 'www.perplexity.ai' };
  global.window = {
    innerHeight: 900,
    getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' }),
    getSelection: () => ({ removeAllRanges: () => {}, addRange: () => {} })
  };
  global.document = {
    querySelectorAll: (sel) => (sel === 'div#ask-input[contenteditable="true"]' ? [editor] : []),
    createRange: () => ({ selectNodeContents: () => {}, collapse: () => {} }),
    execCommand: (_cmd, _ui, text) => {
      execCommandCalls += 1;
      editor.textContent += text;
      return true;
    }
  };
  global.InputEvent = class InputEvent { constructor(type, opts) { this.type = type; Object.assign(this, opts); } };
  global.Event = class Event { constructor(type, opts) { this.type = type; Object.assign(this, opts); } };

  try {
    assert.equal(content.setInputText('Yes'), true);
    assert.equal(editor.textContent, 'Yes');
    assert.equal(execCommandCalls, 0);
  } finally {
    global.document = origDoc;
    global.window = origWin;
    global.location = origLoc;
    global.InputEvent = origInputEvent;
    global.Event = origEvent;
  }
});

test('buildToolbar renders an on-toolbar profile switcher and switchActiveProfile updates storage', () => {
  const origDoc = global.document;
  const origChrome = global.chrome;
  let saved = null;

  global.chrome = {
    storage: {
      sync: {
        set: (values) => { saved = values; }
      }
    }
  };
  global.document = {
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      className: '',
      children: [],
      attributes: {},
      listeners: {},
      style: {},
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(type, fn) { this.listeners[type] = fn; },
      appendChild(child) { this.children.push(child); return child; }
    })
  };

  try {
    const config = {
      activeProfile: 'general',
      profiles: content.DEFAULT_PROFILES,
      quickReplies: content.DEFAULT_PROFILES.general.quickReplies,
      autoSend: false
    };
    const toolbar = content.buildToolbar(config);
    const profileBtn = toolbar.children.find((child) => child.className.includes('cqr-profile-btn'));
    assert.ok(profileBtn, 'toolbar includes profile switcher button');
    assert.equal(profileBtn.textContent, '🌐 ▾');
    assert.equal(profileBtn.attributes['aria-haspopup'], 'menu');

    assert.equal(content.switchActiveProfile('developer', config), true);
    assert.equal(saved.activeProfile, 'developer');
    assert.deepEqual(saved.quickReplies, content.DEFAULT_PROFILES.developer.quickReplies);
    assert.equal(content.switchActiveProfile('nonexistent', config), false);
  } finally {
    global.document = origDoc;
    global.chrome = origChrome;
  }
});

test('fitToolbarToWidth tucks overflowing replies into +N pill and preserves order', () => {
  const makeClassList = (initial = []) => {
    const set = new Set(initial);
    return {
      add: (c) => set.add(c),
      remove: (c) => set.delete(c),
      contains: (c) => set.has(c)
    };
  };
  const replies = [
    { emoji: '🐛', label: 'Debug', text: 'Debug' },
    { emoji: '⚡', label: 'Optimize', text: 'Optimize' },
    { emoji: '🧪', label: 'Add Tests', text: 'Add Tests' },
    { emoji: '📖', label: 'Explain', text: 'Explain' }
  ];
  const replyItems = replies.map((reply) => ({
    reply,
    btn: { classList: makeClassList() }
  }));
  const overflowBtn = {
    classList: makeClassList(['cqr-overflow-hidden']),
    textContent: '',
    title: '',
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; }
  };
  const bar = {
    _replyItems: replyItems,
    _overflowBtn: overflowBtn,
    _overflowReplies: [],
    get scrollWidth() {
      const visibleReplies = replyItems.filter(({ btn }) => !btn.classList.contains('cqr-overflow-hidden')).length;
      const overflowWidth = overflowBtn.classList.contains('cqr-overflow-hidden') ? 0 : 60;
      return visibleReplies * 100 + overflowWidth + 120;
    }
  };

  // Max width 390 fits 2 visible replies (200) + overflow (60) + controls (120) = 380
  content.fitToolbarToWidth(bar, 390);
  assert.equal(overflowBtn.classList.contains('cqr-overflow-hidden'), false);
  assert.equal(overflowBtn.textContent, '+2 ▾');
  assert.deepEqual(bar._overflowReplies.map((r) => r.label), ['Add Tests', 'Explain']);
  assert.equal(replyItems[0].btn.classList.contains('cqr-overflow-hidden'), false);
  assert.equal(replyItems[1].btn.classList.contains('cqr-overflow-hidden'), false);
  assert.equal(replyItems[2].btn.classList.contains('cqr-overflow-hidden'), true);
  assert.equal(replyItems[3].btn.classList.contains('cqr-overflow-hidden'), true);
});

test('buildToolbar compactToolbar mode renders emoji-only chips with accessible labels', () => {
  const origDoc = global.document;
  global.document = {
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      className: '',
      children: [],
      attributes: {},
      listeners: {},
      style: {},
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(type, fn) { this.listeners[type] = fn; },
      appendChild(child) { this.children.push(child); return child; }
    })
  };

  try {
    const toolbar = content.buildToolbar({
      quickReplies: [
        { emoji: '🐛', label: 'Debug', text: 'Debug this' },
        { emoji: '⚡', label: 'Optimize', text: 'Optimize this' }
      ],
      compactToolbar: true,
      autoSend: false
    });
    assert.ok(toolbar.className.includes('cqr-compact'));
    assert.equal(toolbar.children[1].textContent, '🐛');
    assert.equal(toolbar.children[1].attributes['aria-label'], 'Debug');
    assert.equal(toolbar.children[2].textContent, '⚡');
    assert.equal(toolbar.children[2].attributes['aria-label'], 'Optimize');
  } finally {
    global.document = origDoc;
  }
});

test('setInputText does not duplicate multi-line text when execCommand splits paragraphs', () => {
  const origDoc = global.document;
  const origWin = global.window;
  const origLoc = global.location;
  const origInputEvent = global.InputEvent;
  const origEvent = global.Event;

  const paragraph = { textContent: '', focus() {}, dispatchEvent: () => true };
  const editor = {
    tagName: 'DIV',
    isContentEditable: true,
    isConnected: true,
    id: 'prompt-textarea',
    className: '',
    offsetTop: 300,
    textContent: '',
    closest: () => ({}),
    getAttribute: () => null,
    getBoundingClientRect: () => ({ width: 600, height: 40, top: 300 }),
    focus: () => {},
    querySelector: () => paragraph,
    dispatchEvent: () => true
  };

  global.location = { hostname: 'chatgpt.com' };
  global.window = {
    innerHeight: 900,
    getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' }),
    getSelection: () => ({ removeAllRanges: () => {}, addRange: () => {} })
  };
  global.document = {
    querySelectorAll: (sel) => (sel === 'div#prompt-textarea' ? [editor] : []),
    createRange: () => ({ selectNodeContents: () => {}, collapse: () => {} }),
    execCommand: (_cmd, _ui, text) => {
      // Simulate ProseMirror splitting \n\n into separate <p> tags (no newlines in textContent)
      editor.textContent = text.replace(/\n+/g, '');
      return true;
    }
  };
  global.InputEvent = class InputEvent { constructor(type, opts) { this.type = type; Object.assign(this, opts); } };
  global.Event = class Event { constructor(type, opts) { this.type = type; Object.assign(this, opts); } };

  try {
    const multiLine = 'Write tests.\n\nPlease explain your reasoning.';
    assert.equal(content.setInputText(multiLine), true);
    assert.equal(paragraph.textContent, '');
    assert.equal(editor.textContent, 'Write tests.Please explain your reasoning.');
  } finally {
    global.document = origDoc;
    global.window = origWin;
    global.location = origLoc;
    global.InputEvent = origInputEvent;
    global.Event = origEvent;
  }
});

test('suggestReplyLabel and saveQuickReplyToActiveProfile save a new reply to sync storage', () => {
  const origChrome = global.chrome;
  let saved = null;
  global.chrome = {
    storage: {
      sync: {
        set: (values) => { saved = values; }
      }
    }
  };

  try {
    assert.equal(content.suggestReplyLabel('Review this pull request carefully'), 'Review this pull');
    assert.equal(content.suggestReplyLabel('   '), '');

    const config = {
      activeProfile: 'developer',
      profiles: JSON.parse(JSON.stringify(content.DEFAULT_PROFILES))
    };
    const beforeCount = config.profiles.developer.quickReplies.length;
    const ok = content.saveQuickReplyToActiveProfile(
      { emoji: '🔎', label: 'PR Review', text: 'Review {{selection}} for edge cases.' },
      config
    );
    assert.equal(ok, true);
    assert.equal(saved.activeProfile, 'developer');
    assert.equal(saved.quickReplies.length, beforeCount + 1);
    assert.deepEqual(saved.quickReplies.at(-1), {
      emoji: '🔎',
      label: 'PR Review',
      text: 'Review {{selection}} for edge cases.'
    });
  } finally {
    global.chrome = origChrome;
  }
});
