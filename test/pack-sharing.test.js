const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const packSharing = require('../pack-sharing.js');
const { DEFAULT_PROFILES } = require('../profile-packs.js');

const root = path.join(__dirname, '..');

test('encodePack and decodePack round-trip emojis, labels, text, and longPressText', () => {
  const sample = {
    icon: '🚀',
    name: 'Senior Dev Pack',
    quickReplies: [
      { emoji: '🐛', label: 'Root cause', text: 'Find the root cause.', longPressText: 'Find root cause + write a regression test.' },
      { emoji: '🔎', label: 'Simplify', text: 'Simplify: {{selection}}' }
    ]
  };

  const code = packSharing.encodePack(sample);
  assert.ok(code.startsWith(packSharing.PACK_CODE_PREFIX));

  const decoded = packSharing.decodePack(code);
  assert.equal(decoded.ok, true);
  assert.equal(decoded.pack.icon, '🚀');
  assert.equal(decoded.pack.name, 'Senior Dev Pack');
  assert.deepEqual(decoded.pack.quickReplies, sample.quickReplies);
});

test('decodePack extracts PROMPTICON1 codes embedded inside shared messages and accepts raw JSON', () => {
  const msg = packSharing.buildPackShareMessage(DEFAULT_PROFILES.developer);
  assert.match(msg, /Developer Prompticon Pack/);

  const fromMsg = packSharing.decodePack(msg);
  assert.equal(fromMsg.ok, true);
  assert.equal(fromMsg.pack.name, 'Developer');
  assert.equal(fromMsg.pack.quickReplies.length, DEFAULT_PROFILES.developer.quickReplies.length);

  const json = packSharing.exportPackJson(DEFAULT_PROFILES.quiz);
  const fromJson = packSharing.decodePack(json);
  assert.equal(fromJson.ok, true);
  assert.equal(fromJson.pack.name, 'Quiz');
  assert.equal(fromJson.pack.quickReplies.length, 5);
});

test('decodePack safely rejects malformed or empty inputs and sanitizes untrusted packs', () => {
  assert.equal(packSharing.decodePack('').ok, false);
  assert.equal(packSharing.decodePack('not valid json').ok, false);
  assert.equal(packSharing.decodePack('PROMPTICON1:!!!invalid!!!').ok, false);
  assert.equal(packSharing.decodePack(JSON.stringify({ name: 'Empty', quickReplies: [] })).ok, false);

  const sanitized = packSharing.sanitizePack({
    name: '  ' + 'A'.repeat(100),
    icon: '',
    quickReplies: [
      { emoji: '', label: '', text: '   ' },
      { emoji: '✨', label: '', text: 'Review this carefully' }
    ]
  });
  assert.equal(sanitized.ok, true);
  assert.equal(sanitized.pack.name.length, 40);
  assert.equal(sanitized.pack.icon, '📦');
  assert.equal(sanitized.pack.quickReplies.length, 1);
  assert.equal(sanitized.pack.quickReplies[0].label, 'Review this carefull');
});

test('createCustomProfileId generates unique slugs and distinguishes custom from built-in profiles', () => {
  const existing = { ...DEFAULT_PROFILES, custom_my_pack: {} };
  assert.equal(packSharing.createCustomProfileId('My Pack!', existing), 'custom_my_pack_2');
  assert.equal(packSharing.isCustomProfileId('general', DEFAULT_PROFILES), false);
  assert.equal(packSharing.isCustomProfileId('custom_my_pack', DEFAULT_PROFILES), true);
});

test('pack-sharing is packaged in Chrome bundle and wired into popup', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');

  assert.match(packageJson.scripts['pack:chrome'], /pack-sharing\.js/);
  assert.match(popupHtml, /<script src="pack-sharing\.js"><\/script>/);
  assert.match(popupHtml, /id="newPackBtn"/);
  assert.match(popupHtml, /id="sharePackBtn"/);
  assert.match(popupHtml, /id="importPackBtn"/);
  assert.match(popupHtml, /id="packDialog"/);
});
