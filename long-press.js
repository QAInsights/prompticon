(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PrompticonLongPress = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const LONG_PRESS_DELAY_MS = 450;
  const EXPANDED_REPLY_SUFFIX = 'Please explain your reasoning and include useful detail.';

  function getLongPressReply(reply) {
    const shortText = typeof reply?.text === 'string' ? reply.text.trim() : '';
    if (!shortText) return null;

    const configuredVariant = typeof reply.longPressText === 'string' ? reply.longPressText.trim() : '';
    let text = configuredVariant;

    if (!text) {
      if (shortText === 'Yes') text = 'Yes, but explain why.';
      else if (shortText === 'No') text = 'No, but explain why.';
      else if (/^[A-E]$/.test(shortText)) text = `${shortText}. Explain why this is the best answer.`;
      else text = `${shortText}\n\n${EXPANDED_REPLY_SUFFIX}`;
    }

    return { ...reply, text };
  }

  function createLongPressController({ onShortPress, onLongPress, delay = LONG_PRESS_DELAY_MS, setTimeoutFn = setTimeout, clearTimeoutFn = clearTimeout }) {
    let timer = null;
    let longPressActivated = false;

    return {
      start() {
        if (timer !== null) return false;
        longPressActivated = false;
        timer = setTimeoutFn(() => {
          timer = null;
          longPressActivated = true;
          onLongPress();
        }, delay);
        return true;
      },
      end() {
        if (timer !== null) {
          clearTimeoutFn(timer);
          timer = null;
          onShortPress();
          return 'short';
        }
        return longPressActivated ? 'long' : null;
      },
      cancel() {
        if (timer === null) return false;
        clearTimeoutFn(timer);
        timer = null;
        return true;
      }
    };
  }

  function createClickGuard() {
    let suppressNextClick = false;

    return {
      suppress() {
        suppressNextClick = true;
      },
      reset() {
        suppressNextClick = false;
      },
      consume() {
        if (!suppressNextClick) return false;
        suppressNextClick = false;
        return true;
      }
    };
  }

  return { LONG_PRESS_DELAY_MS, getLongPressReply, createLongPressController, createClickGuard };
});
