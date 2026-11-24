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

test('resolveBuiltinValues auto-fills selection and page_title and falls back when empty', () => {
  const filled = templates.resolveBuiltinValues('Simplify this: {{selection}} (from {{page_title}})', {
    selection: '  quantum tunneling  ',
    pageTitle: 'Physics Notes'
  });
  assert.deepEqual(filled.remaining, []);
  assert.equal(filled.partiallyRendered, 'Simplify this: quantum tunneling (from Physics Notes)');

  const mixed = templates.resolveBuiltinValues('Translate {{selection}} to {{language}}', {
    selection: 'Bonjour'
  });
  assert.deepEqual(mixed.remaining, ['language']);
  assert.equal(mixed.partiallyRendered, 'Translate Bonjour to {{language}}');

  const noSelection = templates.resolveBuiltinValues('Explain {{selection}}', { selection: '   ' });
  assert.deepEqual(noSelection.remaining, ['selection']);
  assert.equal(noSelection.partiallyRendered, 'Explain {{selection}}');
});
