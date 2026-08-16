const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const packs = require('../profile-packs.js');

test('curated profile packs include every requested audience with complete reply sets', () => {
  assert.deepEqual(packs.PROFILE_ORDER, [
    'general', 'developer', 'writing', 'student', 'support', 'recruiter', 'sales', 'quiz'
  ]);

  ['developer', 'writing', 'student', 'support', 'recruiter', 'sales'].forEach((id) => {
    assert.ok(packs.DEFAULT_PROFILES[id], `${id} profile is available`);
    assert.equal(packs.DEFAULT_PROFILES[id].quickReplies.length, 6, `${id} has six curated replies`);
  });
});

test('profile picker replaces the fixed tab strip in the popup editor', () => {
  const popupHtml = fs.readFileSync(path.join(__dirname, '..', 'popup.html'), 'utf8');

  assert.match(popupHtml, /<select class="profile-select" id="profileSelect" name="profile"><\/select>/);
  assert.doesNotMatch(popupHtml, /class="profile-tabs"/);
  assert.doesNotMatch(popupHtml, /\.profile-tabs\s*\{/);
});
