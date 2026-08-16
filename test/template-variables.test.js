const test = require('node:test');
const assert = require('node:assert/strict');
const templates = require('../template-variables.js');

test('template variables are unique, ordered, and accept letters, numbers, dashes, and underscores', () => {
  assert.deepEqual(
    templates.getTemplateVariables('Explain {{topic}} for {{audience}}. Compare {{topic}} with {{use_case-2}}.'),
    ['topic', 'audience', 'use_case-2']
  );
  assert.deepEqual(templates.getTemplateVariables('No variables here or {{  }}.'), []);
});

test('template rendering replaces every occurrence and trims entered values', () => {
  assert.equal(
    templates.renderTemplate('Explain {{topic}} for {{audience}}; revisit {{topic}}.', { topic: ' OAuth ', audience: ' beginners ' }),
    'Explain OAuth for beginners; revisit OAuth.'
  );
  assert.equal(templates.renderTemplate('Hello {{name}}', {}), 'Hello ');
});
