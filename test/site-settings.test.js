const test = require('node:test');
const assert = require('node:assert/strict');
const siteSettings = require('../site-settings.js');
const content = require('../content.js');

test('SUPPORTED_SITES exposes unique settings for every supported provider', () => {
  const ids = siteSettings.SUPPORTED_SITES.map((site) => site.id);
  assert.equal(ids.length, 8);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(siteSettings.SUPPORTED_SITES.every((site) => site.id && site.name));
  assert.deepEqual(ids, content.PROVIDERS.map((provider) => provider.id));
});

test('normalizeSiteEnabled defaults sites to enabled and preserves explicit choices', () => {
  const normalized = siteSettings.normalizeSiteEnabled({ grok: false, deepseek: true });

  assert.equal(normalized.grok, false);
  assert.equal(normalized.deepseek, true);
  assert.equal(normalized.chatgpt, true);
  assert.deepEqual(Object.keys(normalized), siteSettings.SUPPORTED_SITES.map((site) => site.id));
});

test('isToolbarEnabled combines the global switch with a site override', () => {
  assert.equal(siteSettings.isToolbarEnabled(true, { grok: false }, 'grok'), false);
  assert.equal(siteSettings.isToolbarEnabled(true, { grok: false }, 'chatgpt'), true);
  assert.equal(siteSettings.isToolbarEnabled(false, { chatgpt: true }, 'chatgpt'), false);
  assert.equal(siteSettings.isToolbarEnabled(true, {}, null), true);
});
