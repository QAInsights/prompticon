const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('Firefox release metadata is present without changing the shared MV3 architecture', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.version, packageJson.version);
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.equal(manifest.incognito, 'not_allowed');
  assert.deepEqual(manifest.commands._execute_action, {
    suggested_key: { default: 'Alt+Shift+P' },
    description: 'Open Prompticon settings'
  });
  assert.deepEqual(manifest.browser_specific_settings, {
    gecko: {
      id: 'prompticon@qainsights.com',
      strict_min_version: '142.0',
      data_collection_permissions: {
        required: ['none']
      }
    }
  });
  assert.equal(manifest.browser_specific_settings.gecko_android, undefined);
});

test('Firefox release commands pin Mozilla tooling and enforce warning-free validation', () => {
  assert.match(packageJson.scripts['lint:firefox'], /web-ext@10\.6\.0 lint/);
  assert.match(packageJson.scripts['lint:firefox'], /--warnings-as-errors/);
  assert.match(packageJson.scripts['pack:firefox'], /web-ext@10\.6\.0 build/);
  assert.match(packageJson.scripts['pack:firefox'], /prompticon-firefox-v\{version\}\.zip/);
  assert.equal(packageJson.scripts['check:firefox'], 'npm test && npm run lint:firefox && npm run pack:firefox');
});
