const test = require('node:test');
const assert = require('node:assert/strict');
const content = require('../content.js');
const manifest = require('../manifest.json');

const ORIGINAL_GLOBALS = Object.fromEntries(
  ['document', 'location', 'window', 'HTMLInputElement', 'HTMLTextAreaElement', 'InputEvent', 'Event', 'KeyboardEvent']
    .map((name) => [name, global[name]])
);

test('manifest uses only storage and static content-script matches for site access', () => {
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.equal(manifest.host_permissions, undefined);
  assert.ok(manifest.content_scripts.every((entry) => entry.matches?.length > 0));
});

function restoreGlobals() {
  Object.entries(ORIGINAL_GLOBALS).forEach(([name, value]) => {
    if (value === undefined) delete global[name];
    else global[name] = value;
  });
}

function createComposer(selector) {
  const tagName = selector.startsWith('textarea') ? 'TEXTAREA' : selector.startsWith('input') ? 'INPUT' : 'DIV';
  const events = [];

  return {
    tagName,
    isContentEditable: tagName === 'DIV',
    isConnected: true,
    className: 'chat-composer',
    id: 'prompt-input',
    offsetTop: 640,
    textContent: '',
    value: '',
    events,
    closest: () => ({}),
    getAttribute: (name) => ({ 'aria-label': 'Message', placeholder: 'Message', 'data-placeholder': 'Message' }[name] || null),
    getBoundingClientRect: () => ({ width: 600, height: 40, top: 640 }),
    focus: () => { events.push('focus'); },
    dispatchEvent: (event) => { events.push(event.type); return true; },
    querySelector: () => null
  };
}

function installInputValueSetters() {
  global.HTMLTextAreaElement = { prototype: {} };
  global.HTMLInputElement = { prototype: {} };

  [global.HTMLTextAreaElement, global.HTMLInputElement].forEach((elementClass) => {
    Object.defineProperty(elementClass.prototype, 'value', {
      set(value) { this.value = value; }
    });
  });
}

function createProviderDocument(inputSelector, composer, sendSelector, sendButton) {
  return {
    body: {},
    documentElement: {},
    querySelectorAll: (selector) => {
      if (selector === inputSelector) return [composer];
      if (selector === 'button') return [sendButton];
      return [];
    },
    querySelector: (selector) => (selector === sendSelector ? sendButton : null),
    createRange: () => ({ selectNodeContents: () => {}, collapse: () => {} }),
    execCommand: (_command, _ui, text) => {
      composer.textContent = text;
      return true;
    }
  };
}

function createSendButton() {
  return {
    isConnected: true,
    disabled: false,
    clicked: 0,
    getAttribute: () => null,
    click() { this.clicked += 1; }
  };
}

function waitForAutoSend() {
  return new Promise((resolve) => setTimeout(resolve, 100));
}

test('every supported provider completes the configured quick-reply workflow', async (t) => {
  const contentScriptMatches = new Set(manifest.content_scripts.flatMap((entry) => entry.matches));

  for (const provider of content.PROVIDERS) {
    await t.test(provider.name, async () => {
      t.after(restoreGlobals);

      const host = provider.hosts[0];
      const inputSelector = provider.inputSelectors[0];
      const sendSelector = provider.sendSelectors[0];
      const composer = createComposer(inputSelector);
      const sendButton = createSendButton();

      global.location = { hostname: host };
      global.window = {
        innerHeight: 900,
        getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' }),
        getSelection: () => ({ removeAllRanges: () => {}, addRange: () => {} })
      };
      global.document = createProviderDocument(inputSelector, composer, sendSelector, sendButton);
      global.InputEvent = class InputEvent { constructor(type, options) { this.type = type; Object.assign(this, options); } };
      global.Event = class Event { constructor(type, options) { this.type = type; Object.assign(this, options); } };
      global.KeyboardEvent = class KeyboardEvent { constructor(type, options) { this.type = type; Object.assign(this, options); } };
      installInputValueSetters();

      assert.ok(contentScriptMatches.has(`https://${host}/*`), `${provider.name} content script is injected`);
      assert.equal(content.getProvider()?.id, provider.id);
      assert.equal(content.getInputEl(), composer);
      assert.equal(content.getSendButton(), sendButton);

      const reply = { text: `Integration reply for ${provider.id}` };
      assert.equal(content.activateQuickReply(reply, { autoSend: true }), true);
      await waitForAutoSend();

      const insertedText = composer.isContentEditable ? composer.textContent : composer.value;
      assert.equal(insertedText, reply.text);
      assert.ok(composer.events.includes('beforeinput'));
      assert.ok(composer.events.includes('input'));
      assert.ok(composer.events.includes('keydown'));
      assert.equal(sendButton.clicked, 1);

    });
  }
});
