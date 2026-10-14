(function initializeSiteSettings(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.PrompticonSiteSettings = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const SUPPORTED_SITES = Object.freeze([
    Object.freeze({ id: "claude", name: "Claude" }),
    Object.freeze({ id: "chatgpt", name: "ChatGPT" }),
    Object.freeze({ id: "gemini", name: "Gemini" }),
    Object.freeze({ id: "grok", name: "Grok" }),
    Object.freeze({ id: "mistral", name: "Mistral" }),
    Object.freeze({ id: "qwen", name: "Qwen" }),
    Object.freeze({ id: "meta", name: "Meta AI" }),
    Object.freeze({ id: "deepseek", name: "DeepSeek" }),
    Object.freeze({ id: "copilot", name: "Copilot" }),
    Object.freeze({ id: "devin", name: "Devin" }),
    Object.freeze({ id: "cursor", name: "Cursor" }),
    Object.freeze({ id: "githubcopilot", name: "GitHub Copilot" }),
    Object.freeze({ id: "jules", name: "Jules" }),
    Object.freeze({ id: "v0", name: "v0" }),
    Object.freeze({ id: "bolt", name: "Bolt" }),
    Object.freeze({ id: "lovable", name: "Lovable" }),
    Object.freeze({ id: "replit", name: "Replit" }),
    Object.freeze({ id: "aistudio", name: "AI Studio" }),
    Object.freeze({ id: "groq", name: "Groq" }),
    Object.freeze({ id: "phind", name: "Phind" }),
  ]);

  function normalizeSiteEnabled(siteEnabled = {}) {
    return Object.fromEntries(
      SUPPORTED_SITES.map((site) => [
        site.id,
        siteEnabled?.[site.id] !== false,
      ]),
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
    isToolbarEnabled,
  };
});
