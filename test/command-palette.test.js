const test = require('node:test');
const assert = require('node:assert/strict');
const palette = require('../command-palette.js');

const replies = [
  { emoji: '🐛', label: 'Debug', text: 'Find the root cause of this bug.' },
  { emoji: '📝', label: 'More detail', text: 'Explain this in more detail.' },
  { emoji: '✨', label: 'Polish', text: 'Improve clarity and grammar.' }
];

test('command palette shortcut only accepts Alt+P', () => {
  assert.equal(palette.isCommandPaletteShortcut({ altKey: true, code: 'KeyP' }), true);
  assert.equal(palette.isCommandPaletteShortcut({ code: 'KeyP' }), false);
  assert.equal(palette.isCommandPaletteShortcut({ altKey: true, ctrlKey: true, code: 'KeyP' }), false);
  assert.equal(palette.isCommandPaletteShortcut({ altKey: true, code: 'KeyP', repeat: true }), false);
  assert.equal(palette.isCommandPaletteShortcut({ altKey: true, code: 'KeyP', isComposing: true }), false);
});

test('command palette searches quick replies by emoji, label, or message text', () => {
  assert.deepEqual(palette.filterQuickReplies(replies, ''), replies);
  assert.deepEqual(palette.filterQuickReplies(replies, 'debug'), [replies[0]]);
  assert.deepEqual(palette.filterQuickReplies(replies, '📝'), [replies[1]]);
  assert.deepEqual(palette.filterQuickReplies(replies, 'grammar'), [replies[2]]);
  assert.deepEqual(palette.filterQuickReplies(replies, 'missing'), []);
});

test('command palette keyboard navigation wraps in both directions', () => {
  assert.equal(palette.getNextActiveIndex(0, 3, 1), 1);
  assert.equal(palette.getNextActiveIndex(2, 3, 1), 0);
  assert.equal(palette.getNextActiveIndex(0, 3, -1), 2);
  assert.equal(palette.getNextActiveIndex(0, 0, 1), -1);
});
