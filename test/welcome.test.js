const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const content = require('../content.js');

const root = path.join(__dirname, '..');

test('first-run toolbar highlights Pick pack until onboarding is completed', () => {
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
    const firstRunBar = content.buildToolbar({
      activeProfile: 'general',
      profiles: content.DEFAULT_PROFILES,
      quickReplies: content.DEFAULT_PROFILES.general.quickReplies,
      onboardingCompleted: false
    });
    const firstRunProfileBtn = firstRunBar.children.find((c) => c.className.includes('cqr-profile-btn'));
    assert.equal(firstRunProfileBtn.textContent, '🌐 Pick pack ▾');
    assert.ok(firstRunProfileBtn.className.includes('cqr-smart-reply-btn'));

    const normalBar = content.buildToolbar({
      activeProfile: 'general',
      profiles: content.DEFAULT_PROFILES,
      quickReplies: content.DEFAULT_PROFILES.general.quickReplies,
      onboardingCompleted: true
    });
    const normalProfileBtn = normalBar.children.find((c) => c.className.includes('cqr-profile-btn'));
    assert.equal(normalProfileBtn.textContent, '🌐 ▾');
  } finally {
    global.document = origDoc;
  }
});

test('welcome quick-setup page is packaged cleanly without extra permissions or innerHTML', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');
  const welcomeScript = fs.readFileSync(path.join(root, 'welcome.js'), 'utf8');

  assert.deepEqual(manifest.permissions, ['storage']);
  assert.equal(manifest.background, undefined);
  assert.match(packageJson.scripts['pack:chrome'], /welcome\.html/);
  assert.match(packageJson.scripts['pack:chrome'], /welcome\.js/);
  assert.match(popupHtml, /id="openWelcomeBtn"/);
  assert.doesNotMatch(welcomeScript, /\.innerHTML\s*=/);
});
