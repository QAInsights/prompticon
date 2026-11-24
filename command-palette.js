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

  function collectAllProfileReplies(profiles, profileOrder = [], activeProfile = 'general') {
    if (!profiles || typeof profiles !== 'object') return [];
    const orderedIds = [
      ...(profiles[activeProfile] ? [activeProfile] : []),
      ...profileOrder.filter((id) => id !== activeProfile && profiles[id]),
      ...Object.keys(profiles).filter((id) => id !== activeProfile && !profileOrder.includes(id))
    ];
    const collected = [];
    for (const id of orderedIds) {
      const profile = profiles[id];
      if (!profile || !Array.isArray(profile.quickReplies)) continue;
      for (const reply of profile.quickReplies) {
        if (!reply) continue;
        collected.push({
          ...reply,
          _profileId: id,
          _profileName: profile.name || id,
          _profileIcon: profile.icon || '💬'
        });
      }
    }
    return collected;
  }

  function filterQuickReplies(replies, query) {
    const normalizedQuery = String(query || '').trim().toLocaleLowerCase();
    const validReplies = Array.isArray(replies) ? replies : [];
    if (!normalizedQuery) return validReplies;

    return validReplies.filter((reply) => {
      const haystack = [reply?.emoji, reply?.label, reply?.text, reply?._profileName]
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
    collectAllProfileReplies,
    filterQuickReplies,
    getNextActiveIndex
  };
});
