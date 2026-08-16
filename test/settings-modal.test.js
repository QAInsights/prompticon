const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('the extension action keeps the editor in the popup', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

  assert.equal(manifest.action.default_popup, 'popup.html');
  assert.equal(manifest.options_ui, undefined);
});

test('settings are confined to a top-right native dialog', () => {
  const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');
  const popupScript = fs.readFileSync(path.join(root, 'popup.js'), 'utf8');

  assert.match(popupHtml, /id="settingsButton"[^>]*aria-label="Open settings"/);
  assert.match(popupHtml, /<dialog class="preferences-dialog" id="preferencesDialog"/);
  assert.match(popupHtml, /Send message on click/);
  assert.match(popupHtml, /Smart question detection/);
  assert.match(popupHtml, /Show quick replies toolbar/);
  assert.match(popupHtml, /Choose websites\s*<span class="site-settings-summary-hint">All enabled by default/);
  assert.match(popupScript, /preferencesDialogEl\.showModal\(\)/);
  assert.match(popupScript, /autoSendEl\.addEventListener\('change', savePreferenceSettings\)/);
  assert.match(popupScript, /siteListEl\.addEventListener\('change', savePreferenceSettings\)/);
});

test('the popup has no native scrollbar', () => {
  const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');

  assert.match(popupHtml, /html,\s*body\s*\{\s*overflow:\s*clip;/);
});

test('donation support is a compact header icon, not a full-width button', () => {
  const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');

  assert.match(popupHtml, /class="header-icon-link donate-trigger ext-link"/);
  assert.match(popupHtml, /aria-label="Support Prompticon on Buy Me a Coffee"/);
  assert.doesNotMatch(popupHtml, /class="donate-btn/);
});

test('quick-reply actions use a compact primary and secondary row', () => {
  const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');

  assert.match(popupHtml, /<div class="actions-row">\s*<button id="add" class="btn action-primary"/);
  assert.match(popupHtml, /id="resetPos" class="btn action-secondary"/);
  assert.match(popupHtml, /\.actions-row\s*\{\s*display:\s*flex;/);
});

test('popup editor keeps the reply controls calm, compact, and accessible', () => {
  const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');
  const popupScript = fs.readFileSync(path.join(root, 'popup.js'), 'utf8');

  assert.match(popupHtml, /Quick replies for your favorite AI chats\./);
  assert.match(popupHtml, /\.row:focus-within/);
  assert.match(popupHtml, /\.list-container\s*\{[\s\S]*gap:\s*7px;/);
  assert.match(popupHtml, /input\[type="text"\]\s*\{[\s\S]*min-height:\s*28px;/);
  assert.match(popupHtml, /\.actions-row\s*\{[\s\S]*margin-top:\s*10px;/);
  assert.match(popupHtml, /background: var\(--accent-dark\);/);
  assert.match(popupHtml, /<footer class="footer" aria-label="Prompticon links">/);
  assert.match(popupHtml, /href="https:\/\/qainsights\.com"/);
  assert.match(popupHtml, /href="https:\/\/ai\.dosa\.dev"/);
  assert.match(popupScript, /aria-label="Reply emoji"/);
  assert.match(popupScript, /aria-label="Reply label"/);
  assert.match(popupScript, /aria-label="Reply text"/);
  assert.match(popupScript, /aria-label="Remove quick reply"/);
});

test('reply and preference updates save immediately and show confirmation', () => {
  const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');
  const popupScript = fs.readFileSync(path.join(root, 'popup.js'), 'utf8');

  assert.doesNotMatch(popupHtml, /id="save"/);
  assert.match(popupHtml, /id="saveToast"[^>]*popover="manual"/);
  assert.match(popupScript, /function saveQuickReplies\(\)/);
  assert.match(popupScript, /function queueQuickReplySave\(\)/);
  assert.match(popupScript, /saveToastEl\.showPopover\(\)/);
});
