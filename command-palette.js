(function initializeCommandPalette(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PrompticonCommandPalette = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  function isCommandPaletteShortcut(event) {
    return Boolean(
      event
      && !event.defaultPrevented
      && !event.isComposing
      && !event.repeat
      && event.altKey
      && !event.ctrlKey
      && !event.metaKey
      && !event.shiftKey
      && event.code === 'KeyP'
    );
  }

  function filterQuickReplies(replies, query) {
    const normalizedQuery = String(query || '').trim().toLocaleLowerCase();
    const validReplies = Array.isArray(replies) ? replies : [];
    if (!normalizedQuery) return validReplies;

    return validReplies.filter((reply) => {
      const haystack = [reply?.emoji, reply?.label, reply?.text]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }

  function getNextActiveIndex(currentIndex, resultCount, offset) {
    if (!Number.isInteger(resultCount) || resultCount <= 0) return -1;
    const normalizedCurrentIndex = Number.isInteger(currentIndex) ? currentIndex : 0;
    const normalizedOffset = Number.isInteger(offset) ? offset : 0;
    return ((normalizedCurrentIndex + normalizedOffset) % resultCount + resultCount) % resultCount;
  }

  return {
    isCommandPaletteShortcut,
    filterQuickReplies,
    getNextActiveIndex
  };
});
