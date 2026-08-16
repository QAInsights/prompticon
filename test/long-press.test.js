const test = require('node:test');
const assert = require('node:assert/strict');
const longPress = require('../long-press.js');

test('long-press variants use explicit text first and provide useful defaults', () => {
  assert.equal(longPress.getLongPressReply({ text: 'Yes' }).text, 'Yes, but explain why.');
  assert.equal(longPress.getLongPressReply({ text: 'A' }).text, 'A. Explain why this is the best answer.');
  assert.equal(
    longPress.getLongPressReply({ text: 'Summarize this', longPressText: 'Summarize this in three bullets.' }).text,
    'Summarize this in three bullets.'
  );
  assert.match(longPress.getLongPressReply({ text: 'Explain this' }).text, /Please explain your reasoning/);
  assert.equal(longPress.getLongPressReply({ text: '  ' }), null);
});

test('long-press controller distinguishes short, long, and cancelled interactions', () => {
  const calls = [];
  const timers = [];
  const controller = longPress.createLongPressController({
    onShortPress: () => calls.push('short'),
    onLongPress: () => calls.push('long'),
    setTimeoutFn: (callback, delay) => {
      timers.push({ callback, delay });
      return timers.length;
    },
    clearTimeoutFn: (id) => { timers[id - 1].cleared = true; }
  });

  assert.equal(controller.start(), true);
  assert.equal(timers[0].delay, longPress.LONG_PRESS_DELAY_MS);
  assert.equal(controller.end(), 'short');
  assert.deepEqual(calls, ['short']);

  controller.start();
  timers[1].callback();
  assert.equal(controller.end(), 'long');
  assert.deepEqual(calls, ['short', 'long']);

  controller.start();
  assert.equal(controller.cancel(), true);
  assert.deepEqual(calls, ['short', 'long']);
});

test('click guard suppresses the browser click that follows a long press exactly once', () => {
  const guard = longPress.createClickGuard();

  assert.equal(guard.consume(), false);
  guard.suppress();
  assert.equal(guard.consume(), true);
  assert.equal(guard.consume(), false);
  guard.suppress();
  guard.reset();
  assert.equal(guard.consume(), false);
});
