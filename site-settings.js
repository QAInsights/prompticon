(function initializeSiteSettings(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PrompticonSiteSettings = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const SUPPORTED_SITES = Object.freeze([
    Object.freeze({ id: 'claude', name: 'Claude' }),
    Object.freeze({ id: 'chatgpt', name: 'ChatGPT' }),
    Object.freeze({ id: 'gemini', name: 'Gemini' }),
    Object.freeze({ id: 'grok', name: 'Grok' }),
    Object.freeze({ id: 'mistral', name: 'Mistral' }),
    Object.freeze({ id: 'qwen', name: 'Qwen' }),
    Object.freeze({ id: 'meta', name: 'Meta AI' }),
    Object.freeze({ id: 'deepseek', name: 'DeepSeek' })
  ]);

  function normalizeSiteEnabled(siteEnabled = {}) {
    return Object.fromEntries(
      SUPPORTED_SITES.map((site) => [site.id, siteEnabled?.[site.id] !== false])
    );
  }

  function isToolbarEnabled(toolbarEnabled, siteEnabled, siteId) {
    if (toolbarEnabled === false) return false;
    if (!siteId) return true;
    return siteEnabled?.[siteId] !== false;
  }

  return {
    SUPPORTED_SITES,
    normalizeSiteEnabled,
    isToolbarEnabled
  };
});
