const DEFAULT_PROFILES = {
  general: {
    name: 'General',
    quickReplies: [
      { emoji: '👍', label: 'Yes', text: 'Yes' }, { emoji: '👎', label: 'No', text: 'No' },
      { emoji: '➡️', label: 'Continue', text: 'Continue' }, { emoji: '📝', label: 'More detail', text: 'Can you go into more detail?' },
      { emoji: '✂️', label: 'Shorter', text: 'Can you make that shorter?' }, { emoji: '🙏', label: 'Thanks', text: "Thanks, that's exactly what I needed." }
    ]
  },
  quiz: {
    name: 'Quiz',
    quickReplies: [
      { emoji: '🇦', label: 'A', text: 'A' }, { emoji: '🇧', label: 'B', text: 'B' },
      { emoji: '🇨', label: 'C', text: 'C' }, { emoji: '🇩', label: 'D', text: 'D' },
      { emoji: '🇪', label: 'E', text: 'E' }
    ]
  }
};

const DEFAULT_REPLIES = DEFAULT_PROFILES.general.quickReplies;

const PROVIDERS = [
  {
    id: 'claude', name: 'Claude', hosts: ['claude.ai', 'www.claude.ai'],
    inputSelectors: ['div[contenteditable="true"].ProseMirror', 'fieldset div[contenteditable="true"]', 'div[contenteditable="true"][aria-label*="Claude" i]', 'div[contenteditable="true"][data-placeholder*="Claude" i]', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]', 'textarea'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[aria-label="Send Message"]', 'button[data-testid="send-button"]', 'button[aria-label^="Send"]']
  },
  {
    id: 'chatgpt', name: 'ChatGPT', hosts: ['chatgpt.com', 'chat.openai.com'],
    inputSelectors: ['div#prompt-textarea', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"][data-placeholder]', 'div[contenteditable="true"]', 'textarea'],
    sendSelectors: ['button[data-testid="send-button"]', 'button[aria-label="Send prompt"]', 'button[aria-label="Send message"]', 'button[aria-label^="Send"]']
  },
  {
    id: 'gemini', name: 'Gemini', hosts: ['gemini.google.com'],
    inputSelectors: ['div[role="textbox"][aria-label*="prompt" i]', 'div.ql-editor.textarea', 'rich-textarea div[contenteditable="true"]', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label="Send message"]', 'button[aria-label="Send Message"]', 'button[aria-label="Submit"]', 'button[aria-label^="Send"]']
  },
  {
    id: 'grok', name: 'Grok', hosts: ['grok.com', 'www.grok.com'],
    inputSelectors: ['textarea[aria-label*="Grok" i]', 'div[data-testid="chat-input"] div[contenteditable="true"]', 'div[data-testid="chat-input"]', 'div[contenteditable="true"]', 'textarea[placeholder*="Ask anything" i]', 'textarea'],
    sendSelectors: ['button[data-testid="send-button"]', 'button[aria-label="Submit"]', 'button[aria-label="Send"]', 'button[aria-label^="Send"]']
  },
  {
    id: 'mistral', name: 'Mistral Le Chat', hosts: ['chat.mistral.ai'],
    inputSelectors: ['div.ProseMirror[contenteditable="true"]', 'div[contenteditable="true"]', 'textarea[data-testid="chat-input"]', 'textarea'],
    sendSelectors: ['button[aria-label="Send message"]', 'button[aria-label="Send"]', 'button[data-testid="send-button"]', 'button[aria-label^="Send"]']
  },
  {
    id: 'qwen', name: 'Qwen Chat', hosts: ['chat.qwen.ai'],
    inputSelectors: ['textarea.message-input-textarea', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label="Send"].send-button', 'button[aria-label="Send"]', 'button[data-testid="send-button"]', 'button[aria-label^="Send"]']
  },
  {
    id: 'meta', name: 'Meta AI', hosts: ['meta.ai', 'www.meta.ai'],
    inputSelectors: ['input[aria-label*="Meta AI" i]', 'textarea[data-testid="prompt-input"]', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label="Send"]', 'button[data-testid="send-button"]', 'button[aria-label^="Send"]']
  }
];

const GENERIC_INPUT_SELECTORS = ['div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]', 'textarea', 'input[type="text"]'];

function getProvider() {
  const host = (typeof location !== 'undefined' && location.hostname ? location.hostname : '').toLowerCase();
  return PROVIDERS.find((p) => p.hosts.includes(host)) || null;
}

function isVisible(el) {
  if (!el || !el.isConnected) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  const style = window.getComputedStyle(el);
  return !(style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0');
}

function scoreInput(el) {
  let s = 0;
  const tag = el.tagName.toLowerCase();
  if (tag === 'textarea' || el.isContentEditable) s += 60;
  else if (tag === 'input') s += 30;
  if (el.closest('form, fieldset, [class*="composer"], [data-testid*="composer"]')) s += 100;
  const hints = [el.getAttribute('aria-label'), el.getAttribute('placeholder'), el.getAttribute('data-placeholder'), el.getAttribute('data-testid'), el.id, el.className].filter(Boolean).join(' ');
  if (/message|prompt|ask|chat|type|reply|compose|input|editor|prosemirror/i.test(hints)) s += 50;
  const rect = el.getBoundingClientRect();
  if (rect.top > window.innerHeight * 0.2) s += 20;
  s += (el.offsetTop || 0) / 1000;
  return s;
}

function queryBest(selector) {
  let best = null, bestScore = -Infinity;
  document.querySelectorAll(selector).forEach((el) => {
    if (!isVisible(el)) return;
    const s = scoreInput(el);
    if (s > bestScore) { bestScore = s; best = el; }
  });
  return best;
}

function getInputEl() {
  const provider = getProvider();
  const selectors = provider ? provider.inputSelectors : GENERIC_INPUT_SELECTORS;
  for (const sel of selectors) {
    const el = queryBest(sel);
    if (el) return el;
  }
  return null;
}

function isModalOpenOnPage() {
  const dialogs = document.querySelectorAll('[role="dialog"], [aria-modal="true"], [data-state="open"][class*="dialog" i]');
  for (const d of dialogs) {
    if (isVisible(d)) return true;
  }
  return false;
}

function getComposerContainer(inputEl) {
  if (!inputEl) return null;

  const card = inputEl.closest('form, fieldset, [class*="input-area"], [class*="composer"], [data-testid*="chat-input"]');
  let start = card || inputEl;
  let best = start;
  let parent = start.parentElement;

  while (parent && parent !== document.body && parent !== document.documentElement) {
    const role = parent.getAttribute('role');
    const isModal = role === 'dialog' || parent.getAttribute('aria-modal') === 'true' || /modal|dialog/i.test(parent.className || '');
    if (isModal) break;

    const r = parent.getBoundingClientRect();
    if (r.width >= window.innerWidth - 24) break;
    if (r.height > window.innerHeight * 0.7) break;

    const style = window.getComputedStyle(parent);
    if (style.borderRadius && style.borderRadius !== '0px' && parseFloat(style.borderRadius) > 6) {
      best = parent;
    } else if (parent.tagName.toLowerCase() === 'form') {
      best = parent;
      break;
    }
    parent = parent.parentElement;
  }
  return best;
}

function getSendButton() {
  const provider = getProvider();
  if (provider) {
    for (const sel of provider.sendSelectors) {
      const btn = document.querySelector(sel);
      if (btn && btn.isConnected && !btn.disabled && btn.getAttribute('aria-disabled') !== 'true') return btn;
    }
    for (const sel of provider.sendSelectors) {
      const btn = document.querySelector(sel);
      if (btn && btn.isConnected) return btn;
    }
  }
  return Array.from(document.querySelectorAll('button')).find((b) => {
    if (b.disabled || b.getAttribute('aria-disabled') === 'true' || !isVisible(b)) return false;
    const hay = [b.getAttribute('aria-label'), b.getAttribute('data-testid'), b.getAttribute('title'), b.textContent].filter(Boolean).join(' ');
    return /send|submit/i.test(hay);
  }) || null;
}

function setInputText(text) {
  const el = getInputEl();
  if (!el) return false;

  const tag = el.tagName.toLowerCase();
  if (tag === 'textarea' || tag === 'input') {
    el.focus();
    const proto = tag === 'textarea' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, text);
    el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: text }));
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  const targetNode = el.querySelector('p') || el;
  targetNode.focus();

  try {
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(targetNode);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  } catch (_) {}

  try {
    targetNode.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: text }));
  } catch (_) {}

  const inserted = document.execCommand('insertText', false, text);

  if (!inserted || !el.textContent.includes(text)) {
    targetNode.textContent = text;
  }

  try {
    targetNode.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
  } catch (_) {}

  return true;
}

function trySend(btn, attemptsLeft = 15) {
  const inputEl = getInputEl();
  if (inputEl) {
    try {
      const enterEvt = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });
      inputEl.dispatchEvent(enterEvt);
    } catch (_) {}
  }

  const targetBtn = btn && btn.isConnected ? btn : getSendButton();
  if (targetBtn && targetBtn.isConnected) {
    const isDisabled = targetBtn.disabled || targetBtn.getAttribute('aria-disabled') === 'true';
    if (!isDisabled) {
      targetBtn.click();
      return;
    }
  }

  if (attemptsLeft > 0) {
    setTimeout(() => trySend(null, attemptsLeft - 1), 70);
  }
}

function parseRgb(colorStr) {
  if (!colorStr || colorStr === 'transparent') return null;
  const m = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return m ? { r: parseInt(m[1], 10), g: parseInt(m[2], 10), b: parseInt(m[3], 10) } : null;
}

function getLuminance(rgb) { return rgb ? (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255 : 1; }

function isTransparentColor(color) {
  if (!color || color === 'transparent') return true;
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) { const alpha = parseFloat(m[1].split(',')[3]); return !isNaN(alpha) && alpha === 0; }
  return false;
}

function getEffectiveBackground(el) {
  let node = el;
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    let bg; try { bg = window.getComputedStyle(node).backgroundColor; } catch (_) { return null; }
    if (bg && !isTransparentColor(bg)) return bg;
    node = node.parentElement;
  }
  return null;
}

function applyNativeStyles() {
  if (!panelEl) return;
  const inputEl = getInputEl();
  if (!inputEl) return;
  let cs; try { cs = window.getComputedStyle(inputEl); } catch (_) { return; }
  const fam = cs.fontFamily;
  if (fam && fam !== 'initial') panelEl.style.setProperty('--cqr-font-family', fam);
  const size = parseFloat(cs.fontSize);
  if (!isNaN(size) && size > 0) panelEl.style.setProperty('--cqr-font-size', Math.min(Math.max(size, 11), 15) + 'px');
  if (cs.color && cs.color !== 'transparent') panelEl.style.setProperty('--cqr-color', cs.color);
  const surface = getEffectiveBackground(inputEl);
  if (surface) panelEl.style.setProperty('--cqr-surface', surface); else panelEl.style.removeProperty('--cqr-surface');
  const isDark = (parseRgb(surface) && getLuminance(parseRgb(surface)) < 0.45) || (parseRgb(cs.color) && getLuminance(parseRgb(cs.color)) > 0.65);
  panelEl.classList.toggle('cqr-dark', isDark);
  panelEl.classList.toggle('cqr-light', !isDark);
}

let panelEl = null, currentInputEl = null, currentConfig = null, isToolbarCollapsed = false;
let customPosition = null, isDragging = false;

function loadConfig() {
  return new Promise((res) => {
    chrome.storage.sync.get(
      { activeProfile: 'general', profiles: DEFAULT_PROFILES, quickReplies: null, autoSend: false },
      (cfg) => {
        const active = cfg.activeProfile || 'general';
        const profs = cfg.profiles || DEFAULT_PROFILES;
        const currentReplies = profs[active]?.quickReplies || cfg.quickReplies || DEFAULT_PROFILES.general.quickReplies;
        res({ quickReplies: currentReplies, autoSend: cfg.autoSend });
      }
    );
  });
}

function setupDraggable(el) {
  let startX = 0, startY = 0, initLeft = 0, initTop = 0, hasMoved = false;

  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    hasMoved = false;

    const r = el.getBoundingClientRect ? el.getBoundingClientRect() : { left: 0, top: 0 };
    initLeft = r.left;
    initTop = r.top;

    const onPointerMove = (m) => {
      const dx = m.clientX - startX, dy = m.clientY - startY;
      if (!hasMoved && Math.hypot(dx, dy) < 5) return;
      if (!hasMoved) {
        hasMoved = true;
        isDragging = true;
        el.classList.add('cqr-dragging');
        try { el.setPointerCapture?.(e.pointerId); } catch (_) {}
      }
      const pw = el.offsetWidth || 0, ph = el.offsetHeight || 0;
      const winW = typeof window !== 'undefined' ? window.innerWidth : 1000;
      const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const newL = Math.max(8, Math.min(winW - pw - 8, initLeft + dx));
      const newT = Math.max(8, Math.min(winH - ph - 8, initTop + dy));
      customPosition = { left: newL, top: newT };
      el.style.left = Math.round(newL) + 'px';
      el.style.top = Math.round(newT) + 'px';
    };

    const onPointerUp = () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      }
      if (hasMoved) {
        el.classList.remove('cqr-dragging');
        setTimeout(() => { isDragging = false; }, 60);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }
  });
}

function resetPosition() {
  customPosition = null;
  positionPanel();
}

function buildToolbar(config) {
  const bar = document.createElement('div');
  bar.className = 'cqr-toolbar' + (isToolbarCollapsed ? ' cqr-collapsed' : '');

  const handle = document.createElement('span');
  handle.className = 'cqr-drag-handle';
  handle.textContent = '⠿';
  handle.title = 'Drag to move toolbar';
  bar.appendChild(handle);

  config.quickReplies.forEach((r) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cqr-btn cqr-reply-btn';
    btn.textContent = `${r.emoji} ${r.label}`;
    btn.title = r.text;
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isDragging) return;
      if (setInputText(r.text) && config.autoSend) setTimeout(() => trySend(getSendButton()), 80);
    });
    bar.appendChild(btn);
  });

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'cqr-btn cqr-toggle-btn';
  toggleBtn.textContent = isToolbarCollapsed ? '💬 Quick Replies' : '✕';
  toggleBtn.title = isToolbarCollapsed ? 'Expand Prompticon quick replies' : 'Collapse quick replies';
  toggleBtn.setAttribute('aria-label', isToolbarCollapsed ? 'Expand quick replies' : 'Collapse quick replies');
  toggleBtn.addEventListener('mousedown', (e) => e.preventDefault());
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isDragging) return;
    isToolbarCollapsed = !isToolbarCollapsed;
    bar.classList.toggle('cqr-collapsed', isToolbarCollapsed);
    toggleBtn.textContent = isToolbarCollapsed ? '💬 Quick Replies' : '✕';
    toggleBtn.title = isToolbarCollapsed ? 'Expand Prompticon quick replies' : 'Collapse quick replies';
    toggleBtn.setAttribute('aria-label', isToolbarCollapsed ? 'Expand quick replies' : 'Collapse quick replies');
    positionPanel();
  });
  bar.appendChild(toggleBtn);

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'cqr-btn cqr-reset-btn';
  resetBtn.textContent = '↺';
  resetBtn.title = 'Reset position above chat composer';
  resetBtn.setAttribute('aria-label', 'Reset position');
  resetBtn.addEventListener('mousedown', (e) => e.preventDefault());
  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isDragging) return;
    resetPosition();
  });
  bar.appendChild(resetBtn);
  setupDraggable(bar);

  return bar;
}

function hidePanel() { if (panelEl) panelEl.classList.remove('cqr-visible'); }

function positionPanel() {
  if (!panelEl || !currentInputEl || isDragging) return;
  const pw = panelEl.offsetWidth, ph = panelEl.offsetHeight;

  if (customPosition && pw > 0) {
    const left = Math.max(8, Math.min(window.innerWidth - pw - 8, customPosition.left));
    const top = Math.max(8, Math.min(window.innerHeight - ph - 8, customPosition.top));
    panelEl.style.left = Math.round(left) + 'px';
    panelEl.style.top = Math.round(top) + 'px';
    return;
  }

  const c = getComposerContainer(currentInputEl) || currentInputEl;
  const r = c.getBoundingClientRect();
  if (r.width <= 0 || r.bottom < 0 || r.top > window.innerHeight) { hidePanel(); return; }

  const maxW = Math.min(Math.round(r.width), window.innerWidth - 24);
  panelEl.style.maxWidth = maxW + 'px';
  panelEl.style.width = 'max-content';

  let top = r.top - (ph || 30) - 10;
  const left = isToolbarCollapsed ? r.left + 4 : r.left + (r.width - pw) / 2;

  panelEl.style.top = Math.round(top < 8 ? r.bottom + 10 : top) + 'px';
  panelEl.style.left = Math.round(Math.max(12, Math.min(left, window.innerWidth - pw - 12))) + 'px';
}

function syncPanel() {
  if (isModalOpenOnPage()) { hidePanel(); return; }
  currentInputEl = getInputEl();
  if (!currentInputEl || !panelEl) { hidePanel(); return; }
  applyNativeStyles();
  positionPanel();
  panelEl.classList.add('cqr-visible');
}

async function initPanel() {
  if (panelEl) return;
  currentConfig = await loadConfig();
  if (!currentConfig || !currentConfig.quickReplies || currentConfig.quickReplies.length === 0) return;
  if (panelEl) return;
  panelEl = buildToolbar(currentConfig);
  if (document.body) {
    document.body.appendChild(panelEl);
  } else if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      if (panelEl && !panelEl.isConnected && document.body) {
        document.body.appendChild(panelEl);
        syncPanel();
      }
    }, { once: true });
  }
  syncPanel();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof chrome !== 'undefined' && chrome.storage) {
  window.addEventListener('scroll', () => { if (panelEl?.classList.contains('cqr-visible')) positionPanel(); }, true);
  window.addEventListener('resize', () => { if (panelEl) positionPanel(); });

  let debounceTimer = null;
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(() => { clearTimeout(debounceTimer); debounceTimer = setTimeout(syncPanel, 150); }).observe(document.body, { childList: true, subtree: true });
  }
  setInterval(syncPanel, 2000);
  if (chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes?.resetPosition) {
        resetPosition();
        return;
      }
      if (panelEl) { panelEl.remove(); panelEl = null; }
      currentConfig = null;
      initPanel();
    });
  }
  initPanel();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_PROFILES,
    DEFAULT_REPLIES,
    PROVIDERS,
    getProvider,
    scoreInput,
    parseRgb,
    getLuminance,
    isTransparentColor,
    isModalOpenOnPage,
    getComposerContainer,
    loadConfig,
    buildToolbar,
    setupDraggable,
    resetPosition,
    initPanel
  };
}
