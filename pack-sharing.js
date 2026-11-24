(function initializePackSharing(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PrompticonPackSharing = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const PACK_CODE_PREFIX = 'PROMPTICON1:';
  const PACK_FORMAT_VERSION = 1;
  const MAX_REPLIES_PER_PACK = 30;
  const MAX_NAME_LENGTH = 40;
  const MAX_ICON_LENGTH = 8;
  const MAX_LABEL_LENGTH = 48;
  const MAX_TEXT_LENGTH = 2000;
  const LOCAL_PROFILES_FALLBACK_KEY = 'profilesLocalFallback';

  function utf8ToBase64Url(str) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    }
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function base64UrlToUtf8(b64url) {
    const padded = b64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64url.length % 4)) % 4);
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf8');
    }
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function sanitizeReply(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const text = typeof raw.text === 'string' ? raw.text.trim().slice(0, MAX_TEXT_LENGTH) : '';
    if (!text) return null;
    const emoji = typeof raw.emoji === 'string' && raw.emoji.trim()
      ? raw.emoji.trim().slice(0, MAX_ICON_LENGTH)
      : '💬';
    const label = typeof raw.label === 'string' && raw.label.trim()
      ? raw.label.trim().slice(0, MAX_LABEL_LENGTH)
      : text.slice(0, 20).trim();
    const reply = { emoji, label, text };
    if (typeof raw.longPressText === 'string' && raw.longPressText.trim()) {
      reply.longPressText = raw.longPressText.trim().slice(0, MAX_TEXT_LENGTH);
    }
    return reply;
  }

  function sanitizePack(raw) {
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: 'Pack data must be a valid object.' };
    }
    const rawReplies = Array.isArray(raw.quickReplies) ? raw.quickReplies : [];
    const quickReplies = [];
    for (const item of rawReplies) {
      if (quickReplies.length >= MAX_REPLIES_PER_PACK) break;
      const clean = sanitizeReply(item);
      if (clean) quickReplies.push(clean);
    }
    if (!quickReplies.length) {
      return { ok: false, error: 'Pack must include at least one quick reply.' };
    }
    const name = typeof raw.name === 'string' && raw.name.trim()
      ? raw.name.trim().slice(0, MAX_NAME_LENGTH)
      : 'Imported Pack';
    const icon = typeof raw.icon === 'string' && raw.icon.trim()
      ? raw.icon.trim().slice(0, MAX_ICON_LENGTH)
      : '📦';

    return {
      ok: true,
      pack: {
        v: PACK_FORMAT_VERSION,
        icon,
        name,
        quickReplies
      }
    };
  }

  function encodePack(profile) {
    const validated = sanitizePack(profile);
    if (!validated.ok) return null;
    const json = JSON.stringify(validated.pack);
    return PACK_CODE_PREFIX + utf8ToBase64Url(json);
  }

  function exportPackJson(profile) {
    const validated = sanitizePack(profile);
    if (!validated.ok) return null;
    return JSON.stringify(validated.pack, null, 2);
  }

  function decodePack(input) {
    const trimmed = typeof input === 'string' ? input.trim() : '';
    if (!trimmed) return { ok: false, error: 'Paste a Prompticon share code or JSON pack.' };

    // Extract PROMPTICON1:... even if pasted inside a larger message (e.g. Slack/X/email)
    const codeMatch = trimmed.match(/PROMPTICON1:[A-Za-z0-9_-]+/);
    let jsonStr = trimmed;
    if (codeMatch) {
      try {
        jsonStr = base64UrlToUtf8(codeMatch[0].slice(PACK_CODE_PREFIX.length));
      } catch (_) {
        return { ok: false, error: 'Could not decode that share code.' };
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (_) {
      return { ok: false, error: 'Invalid pack format. Paste a PROMPTICON1 code or JSON.' };
    }
    return sanitizePack(parsed);
  }

  function createCustomProfileId(name, existingProfiles = {}) {
    const base = String(name || 'pack')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 24) || 'pack';
    let candidate = `custom_${base}`;
    let suffix = 2;
    while (existingProfiles && candidate in existingProfiles) {
      candidate = `custom_${base}_${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  function isCustomProfileId(profileId, defaultProfiles = {}) {
    return Boolean(profileId && !(profileId in defaultProfiles));
  }

  function buildPackShareMessage(profile) {
    const code = encodePack(profile);
    if (!code) return null;
    const name = profile?.name || 'Custom';
    const icon = profile?.icon || '📦';
    const count = Array.isArray(profile?.quickReplies) ? profile.quickReplies.length : 0;
    return `${icon} ${name} Prompticon Pack (${count} quick replies) — Import in Prompticon:\n${code}`;
  }

  return {
    PACK_CODE_PREFIX,
    PACK_FORMAT_VERSION,
    LOCAL_PROFILES_FALLBACK_KEY,
    sanitizePack,
    encodePack,
    exportPackJson,
    decodePack,
    createCustomProfileId,
    isCustomProfileId,
    buildPackShareMessage
  };
});
