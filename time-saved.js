(function initializeTimeSaved(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.PrompticonTimeSaved = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const TIME_SAVED_STORAGE_KEY = 'timeSavedStats';
  const TIME_SAVED_SETTING_KEY = 'timeSavedTracking';
  const TYPING_CHARS_PER_SECOND = 3.33;
  const DECISION_OVERHEAD_SECONDS = 2;
  const MAX_SECONDS_PER_USE = 300;

  function createEmptyStats() {
    return { totalSeconds: 0, uses: 0, firstUsedAt: null, lastUsedAt: null };
  }

  function normalizeStats(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const totalSeconds = source.totalSeconds;
    const uses = source.uses;
    const firstUsedAt = source.firstUsedAt;
    const lastUsedAt = source.lastUsedAt;
    return {
      totalSeconds: Number.isFinite(totalSeconds) && totalSeconds >= 0 ? Math.round(totalSeconds) : 0,
      uses: Number.isFinite(uses) && uses >= 0 ? Math.floor(uses) : 0,
      firstUsedAt: Number.isFinite(firstUsedAt) && firstUsedAt > 0 ? firstUsedAt : null,
      lastUsedAt: Number.isFinite(lastUsedAt) && lastUsedAt > 0 ? lastUsedAt : null,
    };
  }

  function estimateSecondsSaved(text) {
    const trimmed = typeof text === 'string' ? text.trim() : '';
    if (!trimmed) return 0;
    return Math.min(
      MAX_SECONDS_PER_USE,
      Math.round(DECISION_OVERHEAD_SECONDS + trimmed.length / TYPING_CHARS_PER_SECOND),
    );
  }

  function recordUsage(stats, text, timestamp = Date.now()) {
    const normalized = normalizeStats(stats);
    const estimate = estimateSecondsSaved(text);
    if (!estimate || !Number.isFinite(timestamp) || timestamp <= 0) return normalized;
    return {
      totalSeconds: normalized.totalSeconds + estimate,
      uses: normalized.uses + 1,
      firstUsedAt: normalized.firstUsedAt || timestamp,
      lastUsedAt: timestamp,
    };
  }

  function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
    const rounded = Math.round(seconds);
    if (rounded < 60) return `${rounded}s`;
    const minutes = Math.floor(rounded / 60);
    const remainingSeconds = rounded % 60;
    if (minutes < 60) {
      return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  return {
    TIME_SAVED_STORAGE_KEY,
    TIME_SAVED_SETTING_KEY,
    TYPING_CHARS_PER_SECOND,
    DECISION_OVERHEAD_SECONDS,
    MAX_SECONDS_PER_USE,
    createEmptyStats,
    normalizeStats,
    estimateSecondsSaved,
    recordUsage,
    formatDuration,
  };
});
