const test = require('node:test');
const assert = require('node:assert/strict');
const {
  MAX_SECONDS_PER_USE,
  createEmptyStats,
  normalizeStats,
  estimateSecondsSaved,
  recordUsage,
  formatDuration
} = require('../time-saved.js');

test('estimateSecondsSaved handles empty, short, and capped replies', () => {
  assert.equal(estimateSecondsSaved(), 0);
  assert.equal(estimateSecondsSaved('   '), 0);
  assert.equal(estimateSecondsSaved(null), 0);
  assert.equal(estimateSecondsSaved('Hi'), 3);
  assert.equal(estimateSecondsSaved('x'.repeat(2000)), MAX_SECONDS_PER_USE);
});

test('normalizeStats sanitizes garbage without mutating the input', () => {
  const raw = {
    totalSeconds: -2.6,
    uses: 3.9,
    firstUsedAt: 'not a timestamp',
    lastUsedAt: Infinity
  };
  const normalized = normalizeStats(raw);

  assert.deepEqual(normalized, {
    totalSeconds: 0,
    uses: 3,
    firstUsedAt: null,
    lastUsedAt: null
  });
  assert.deepEqual(raw, {
    totalSeconds: -2.6,
    uses: 3.9,
    firstUsedAt: 'not a timestamp',
    lastUsedAt: Infinity
  });
  assert.deepEqual(normalizeStats({
    totalSeconds: 4.6,
    uses: 7.9,
    firstUsedAt: 100,
    lastUsedAt: 200
  }), {
    totalSeconds: 5,
    uses: 7,
    firstUsedAt: 100,
    lastUsedAt: 200
  });
});

test('recordUsage accumulates estimates and preserves first and last timestamps', () => {
  const empty = createEmptyStats();
  const first = recordUsage(empty, 'Hi', 100);
  const second = recordUsage(first, 'Longer reply', 200);

  assert.deepEqual(first, {
    totalSeconds: estimateSecondsSaved('Hi'),
    uses: 1,
    firstUsedAt: 100,
    lastUsedAt: 100
  });
  assert.equal(second.totalSeconds, first.totalSeconds + estimateSecondsSaved('Longer reply'));
  assert.equal(second.uses, 2);
  assert.equal(second.firstUsedAt, 100);
  assert.equal(second.lastUsedAt, 200);
  assert.deepEqual(recordUsage(second, '', 300), second);
  assert.deepEqual(recordUsage(second, 'Still valid', 0), second);
});

test('formatDuration uses compact seconds, minutes, and hours formats', () => {
  assert.equal(formatDuration(0), '0s');
  assert.equal(formatDuration(Number.NaN), '0s');
  assert.equal(formatDuration(45), '45s');
  assert.equal(formatDuration(200), '3m 20s');
  assert.equal(formatDuration(120), '2m');
  assert.equal(formatDuration(3600), '1h');
  assert.equal(formatDuration(7500), '2h 5m');
});
