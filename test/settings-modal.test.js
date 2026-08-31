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

test('time-saved tracking is packaged and configurable', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');
  const popupScript = fs.readFileSync(path.join(root, 'popup.js'), 'utf8');
  const contentScripts = manifest.content_scripts[0].js;

  assert.ok(contentScripts.indexOf('time-saved.js') < contentScripts.indexOf('content.js'));
  assert.match(packageJson.scripts['pack:chrome'], /time-saved\.js/);
  assert.match(popupHtml, /id="timeSavedCard"/);
  assert.match(popupHtml, /id="timeSavedValue"/);
  assert.match(popupHtml, /id="timeSavedDetail"/);
  assert.match(popupHtml, /id="timeSavedTracking"/);
  assert.match(popupHtml, /id="resetTimeSaved"/);
  assert.match(popupScript, /resetTimeSavedEl\.addEventListener\('click'/);
  assert.match(popupScript, /timeSavedTrackingEl\.addEventListener\('change'/);
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
  assert.match(popupScript, /'Reply emoji'/);
  assert.match(popupScript, /'Reply label'/);
  assert.match(popupScript, /'Reply text'/);
  assert.match(popupScript, /'Remove quick reply'/);
});

test('popup renders stored reply values as text instead of parsing markup', () => {
  const popupScript = fs.readFileSync(path.join(root, 'popup.js'), 'utf8');

  assert.doesNotMatch(popupScript, /\.innerHTML\s*=/);
  assert.match(popupScript, /listEl\.replaceChildren\(\)/);
  assert.match(popupScript, /input\.value = typeof value === 'string' \? value : ''/);
  assert.match(popupScript, /removeButton\.textContent = '\\u00d7'/);
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
