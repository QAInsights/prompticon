const SITE_SETTINGS = typeof module !== 'undefined' && module.exports
  ? require('./site-settings.js')
  : globalThis.PrompticonSiteSettings;
const COMMAND_PALETTE = typeof module !== 'undefined' && module.exports
  ? require('./command-palette.js')
  : globalThis.PrompticonCommandPalette;
const SMART_DETECTION = typeof module !== 'undefined' && module.exports
  ? require('./smart-detection.js')
  : globalThis.PrompticonSmartDetection;
const PROFILE_PACKS = typeof module !== 'undefined' && module.exports
  ? require('./profile-packs.js')
  : globalThis.PrompticonProfilePacks;
const LONG_PRESS = typeof module !== 'undefined' && module.exports
  ? require('./long-press.js')
  : globalThis.PrompticonLongPress;
const TEMPLATE_VARIABLES = typeof module !== 'undefined' && module.exports
  ? require('./template-variables.js')
  : globalThis.PrompticonTemplateVariables;
const TIME_SAVED = typeof module !== 'undefined' && module.exports
  ? require('./time-saved.js')
  : globalThis.PrompticonTimeSaved;
const { DEFAULT_PROFILES } = PROFILE_PACKS;

const DEFAULT_REPLIES = DEFAULT_PROFILES.general.quickReplies;
const POSITION_STORAGE_KEY = 'toolbarPositions';
const MAX_INCLUDED_DEFAULT_REPLIES = 3;
const DEFAULT_FADE_DELAY_SECONDS = 3;

const PROVIDERS = [
  {
    id: 'claude', name: 'Claude', hosts: ['claude.ai', 'www.claude.ai'],
    inputSelectors: ['div[contenteditable="true"].ProseMirror', 'fieldset div[contenteditable="true"]', 'div[contenteditable="true"][aria-label*="Claude" i]', 'div[contenteditable="true"][data-placeholder*="Claude" i]', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]', 'textarea'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[aria-label="Send Message"]', 'button[data-testid="send-button"]', 'button[aria-label^="Send"]'],
    assistantSelectors: ['[data-testid="assistant-message"]', '.font-claude-response', '.font-claude-message', '[data-is-streaming]']
  },
  {
    id: 'chatgpt', name: 'ChatGPT', hosts: ['chatgpt.com', 'chat.openai.com', 'platform.openai.com'],
    inputSelectors: ['div#prompt-textarea', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"][data-placeholder]', 'div[contenteditable="true"]', 'textarea'],
    sendSelectors: ['button[data-testid="send-button"]', 'button[aria-label="Send prompt"]', 'button[aria-label="Send message"]', 'button[aria-label^="Send"]'],
    assistantSelectors: ['[data-message-author-role="assistant"]']
  },
  {
    id: 'gemini', name: 'Gemini', hosts: ['gemini.google.com'],
    inputSelectors: ['div[role="textbox"][aria-label*="prompt" i]', 'div.ql-editor.textarea', 'rich-textarea div[contenteditable="true"]', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label="Send message"]', 'button[aria-label="Send Message"]', 'button[aria-label="Submit"]', 'button[aria-label^="Send"]'],
    assistantSelectors: ['model-response', 'message-content', '.model-response-text']
  },
  {
    id: 'grok', name: 'Grok', hosts: ['grok.com', 'www.grok.com'],
    inputSelectors: ['textarea[aria-label*="Grok" i]', 'div[data-testid="chat-input"] div[contenteditable="true"]', 'div[data-testid="chat-input"]', 'div[contenteditable="true"]', 'textarea[placeholder*="Ask anything" i]', 'textarea'],
    sendSelectors: ['button[data-testid="send-button"]', 'button[aria-label="Submit"]', 'button[aria-label="Send"]', 'button[aria-label^="Send"]'],
    assistantSelectors: ['[data-testid*="assistant" i]', '.message-bubble', '[class*="response-content" i]']
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
  },
  {
    id: 'deepseek', name: 'DeepSeek', hosts: ['chat.deepseek.com'],
    inputSelectors: ['textarea[placeholder*="Message" i]', 'textarea[placeholder*="DeepSeek" i]', 'textarea', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]'],
    sendSelectors: ['button[type="submit"]', 'button[aria-label*="Send" i]', 'button[title*="Send" i]', 'button[data-testid="send-button"]', 'button[class*="send" i]']
  },
  {
    id: 'copilot', name: 'Copilot', hosts: ['copilot.microsoft.com'],
    inputSelectors: ['textarea#userInput', 'textarea[aria-label*="Copilot" i]', 'textarea[placeholder*="message" i]', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]', 'textarea'],
    sendSelectors: ['button[aria-label*="Submit" i]', 'button[aria-label*="Send" i]', 'button[type="submit"]', 'button[data-testid="send-button"]']
  },
  {
    id: 'devin', name: 'Devin', hosts: ['app.devin.ai'],
    inputSelectors: ['textarea[placeholder*="Devin" i]', 'textarea[placeholder*="Ask" i]', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]', 'textarea'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[type="submit"]', 'button[data-testid*="send" i]', 'button[aria-label^="Send"]']
  },
  {
    id: 'cursor', name: 'Cursor', hosts: ['cursor.com', 'www.cursor.com'],
    inputSelectors: ['textarea[placeholder*="Agent" i]', 'textarea[placeholder*="Ask" i]', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]', 'textarea'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[type="submit"]', 'button[data-testid*="send" i]']
  },
  {
    id: 'githubcopilot', name: 'GitHub Copilot', hosts: ['github.com'],
    inputSelectors: ['textarea[placeholder*="Copilot" i]', 'textarea[placeholder*="Ask" i]', 'textarea', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[type="submit"]', 'button[aria-label*="Submit" i]']
  },
  {
    id: 'jules', name: 'Jules', hosts: ['jules.google.com'],
    inputSelectors: ['textarea[placeholder*="task" i]', 'textarea[placeholder*="Ask" i]', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[type="submit"]']
  },
  {
    id: 'v0', name: 'v0', hosts: ['v0.dev'],
    inputSelectors: ['textarea[placeholder*="v0" i]', 'textarea[placeholder*="Ask" i]', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]', 'textarea'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[type="submit"]']
  },
  {
    id: 'bolt', name: 'Bolt', hosts: ['bolt.new'],
    inputSelectors: ['textarea[placeholder*="Bolt" i]', 'textarea[placeholder*="build" i]', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[type="submit"]']
  },
  {
    id: 'lovable', name: 'Lovable', hosts: ['lovable.dev'],
    inputSelectors: ['textarea[placeholder*="Lovable" i]', 'textarea[placeholder*="Ask" i]', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[type="submit"]']
  },
  {
    id: 'replit', name: 'Replit', hosts: ['replit.com', 'www.replit.com'],
    inputSelectors: ['textarea[placeholder*="Agent" i]', 'textarea[placeholder*="Ask" i]', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[type="submit"]']
  },
  {
    id: 'aistudio', name: 'AI Studio', hosts: ['aistudio.google.com'],
    inputSelectors: ['textarea[placeholder*="prompt" i]', 'textarea', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label*="Run" i]', 'button[aria-label*="Send" i]', 'button[type="submit"]']
  },
  {
    id: 'groq', name: 'Groq', hosts: ['groq.com', 'www.groq.com'],
    inputSelectors: ['textarea[placeholder*="message" i]', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[type="submit"]']
  },
  {
    id: 'phind', name: 'Phind', hosts: ['phind.com', 'www.phind.com'],
    inputSelectors: ['textarea[placeholder*="Ask" i]', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[type="submit"]', 'button[aria-label*="Ask" i]']
  },
  {
    id: 'perplexity', name: 'Perplexity', hosts: ['perplexity.ai', 'www.perplexity.ai'],
    inputSelectors: ['div#ask-input[contenteditable="true"]', 'textarea[placeholder*="Ask" i]', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]', 'textarea'],
    sendSelectors: ['button[aria-label*="Submit" i]', 'button[aria-label*="Send" i]', 'button[data-testid="submit-button"]', 'button[type="submit"]'],
    assistantSelectors: ['[data-testid="answer"]', '.prose', '[class*="markdown" i]']
  },
  {
    id: 'notebooklm', name: 'NotebookLM', hosts: ['notebooklm.google.com'],
    inputSelectors: ['textarea[aria-label*="query" i]', 'textarea[placeholder*="Start typing" i]', 'textarea[placeholder*="Ask" i]', 'textarea', 'div[contenteditable="true"][role="textbox"]'],
    sendSelectors: ['button[aria-label*="Submit" i]', 'button[aria-label*="Send" i]', 'button[type="submit"]'],
    assistantSelectors: ['.to-user-container', '[class*="response" i]']
  },
  {
    id: 'poe', name: 'Poe', hosts: ['poe.com', 'www.poe.com'],
    inputSelectors: ['textarea[class*="GrowingTextArea" i]', 'textarea[placeholder*="Talk" i]', 'textarea[placeholder*="Message" i]', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[class*="SendButton" i]', 'button[aria-label*="Send" i]', 'button[type="submit"]']
  },
  {
    id: 'lmarena', name: 'LMArena', hosts: ['lmarena.ai', 'chat.lmsys.org'],
    inputSelectors: ['textarea[placeholder*="Ask" i]', 'textarea[placeholder*="Enter" i]', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[type="submit"]', 'button[aria-label*="Send" i]', 'button[aria-label*="Submit" i]']
  },
  {
    id: 'openrouter', name: 'OpenRouter', hosts: ['openrouter.ai'],
    inputSelectors: ['textarea[placeholder*="Start" i]', 'textarea[placeholder*="message" i]', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label*="Send" i]', 'button[type="submit"]']
  },
  {
    id: 'kimi', name: 'Kimi', hosts: ['kimi.com', 'www.kimi.com'],
    inputSelectors: ['div.chat-input-editor[contenteditable="true"]', 'div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]', 'textarea'],
    sendSelectors: ['button[class*="send" i]', 'button[aria-label*="Send" i]', 'button[type="submit"]']
  }
];

const GENERIC_INPUT_SELECTORS = ['div[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]', 'textarea', 'input[type="text"]'];
const ASSISTANT_MESSAGE_SELECTORS = [
  '[data-message-author-role="assistant"]',
  '[data-message-role="assistant"]',
  '[data-author="assistant"]',
  '[data-testid*="assistant" i]',
  '[class*="assistant-message" i]'
];

function getProvider() {
  const host = (typeof location !== 'undefined' && location.hostname ? location.hostname : '').toLowerCase();
  return PROVIDERS.find((p) => p.hosts.includes(host)) || null;
}

function isToolbarEnabledForSite(toolbarEnabled, siteEnabled, provider = getProvider()) {
  return SITE_SETTINGS.isToolbarEnabled(toolbarEnabled, siteEnabled, provider?.id || null);
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

function getLatestAssistantResponseText() {
  if (typeof document === 'undefined') return '';

  const provider = getProvider();
  const selectors = provider?.assistantSelectors?.length
    ? [...provider.assistantSelectors, ...ASSISTANT_MESSAGE_SELECTORS]
    : ASSISTANT_MESSAGE_SELECTORS;

  for (const selector of selectors) {
    const candidates = Array.from(document.querySelectorAll?.(selector) || []);
    for (let index = candidates.length - 1; index >= 0; index -= 1) {
      const candidate = candidates[index];
      if (candidate.closest?.('.cqr-toolbar, .cqr-command-palette, .cqr-template-dialog, .cqr-save-dialog') || !isVisible(candidate)) continue;
      const text = (candidate.innerText || candidate.textContent || '').trim();
      if (text) return text;
    }
  }
  return '';
}

function getSmartRepliesForPage(enabled) {
  if (enabled !== true) return [];
  return SMART_DETECTION.detectSmartReplies(getLatestAssistantResponseText());
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

function getInputText() {
  const el = getInputEl();
  if (!el) return '';
  const tag = (el.tagName || '').toLowerCase();
  if (tag === 'textarea' || tag === 'input') return String(el.value || '').trim();
  return String(el.innerText || el.textContent || '').trim();
}

function getPageContext() {
  let selection = '';
  try {
    selection = typeof window !== 'undefined' ? String(window.getSelection?.()?.toString?.() || '').trim() : '';
  } catch (_) {}
  const pageTitle = typeof document !== 'undefined' && typeof document.title === 'string'
    ? document.title.trim()
    : '';
  return { selection, pageTitle };
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

  const beforeText = el.textContent || '';
  let beforeInputHandled = false;

  try {
    const beforeEvt = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: text });
    const notCanceled = targetNode.dispatchEvent(beforeEvt);
    const afterBeforeInputText = el.textContent || '';
    beforeInputHandled = !notCanceled
      || beforeEvt.defaultPrevented === true
      || (afterBeforeInputText !== beforeText && afterBeforeInputText.includes(text));
  } catch (_) {}

  if (!beforeInputHandled) {
    const inserted = document.execCommand('insertText', false, text);
    const compact = (value) => String(value || '').replace(/\s+/g, '');
    const afterExecText = el.textContent || '';
    const didInsert = inserted && (afterExecText !== beforeText || compact(afterExecText).includes(compact(text)));

    if (!didInsert) {
      targetNode.textContent = text;
    }
  }

  try {
    targetNode.dispatchEvent(new Event('input', { bubbles: true }));
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

function getShortcutIndex(event) {
  if (!event || event.defaultPrevented || event.isComposing || event.repeat) return null;
  if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return null;

  const match = /^Digit([1-9])$/.exec(event.code || '');
  return match ? Number(match[1]) - 1 : null;
}

function getShortcutReply(config, event) {
  const index = getShortcutIndex(event);
  return index === null ? null : config?.quickReplies?.[index] || null;
}

function isTrustedUserEvent(event) {
  return event?.isTrusted === true;
}

function getReplyDisplayLabel(reply) {
  const label = typeof reply?.label === 'string' ? reply.label.trim() : '';
  return label || 'Untitled reply';
}

function getReplyButtonTitle(reply, config, index, hasLongPress = false) {
  const action = config?.autoSend ? 'Send' : 'Fill';
  const shortcut = index < 9 ? ` (Alt+${index + 1})` : '';
  const longPressHint = hasLongPress ? ' — hold for expanded reply' : '';
  return `${action} ${getReplyDisplayLabel(reply)}${shortcut}${longPressHint}`;
}

function insertQuickReply(reply, config) {
  if (!reply || !config || !setInputText(reply.text)) return false;
  recordTimeSaved(reply.text, config);
  if (config.autoSend) setTimeout(() => trySend(getSendButton()), 80);
  return true;
}

function recordTimeSaved(text, config) {
  if (config?.timeSavedTracking === false) return;
  const storage = typeof chrome !== 'undefined' ? chrome.storage?.local : null;
  if (!storage) return;

  try {
    storage.get({ [TIME_SAVED.TIME_SAVED_STORAGE_KEY]: {} }, (result) => {
      try {
        const stats = TIME_SAVED.recordUsage(result?.[TIME_SAVED.TIME_SAVED_STORAGE_KEY], text);
        storage.set({ [TIME_SAVED.TIME_SAVED_STORAGE_KEY]: stats });
      } catch (_) {}
    });
  } catch (_) {}
}

function activateQuickReply(reply, config) {
  if (!reply || !config) return false;
  const { remaining, partiallyRendered } = TEMPLATE_VARIABLES.resolveBuiltinValues(reply.text, getPageContext());
  const resolvedReply = partiallyRendered === reply.text ? reply : { ...reply, text: partiallyRendered };
  if (!remaining.length) return insertQuickReply(resolvedReply, config);
  return openTemplateVariableDialog(resolvedReply, config, remaining);
}

function addQuickReplyInteraction(button, reply, config) {
  const longPressReply = LONG_PRESS.getLongPressReply(reply);
  let pressInProgress = false;
  const clickGuard = LONG_PRESS.createClickGuard();
  const controller = longPressReply && LONG_PRESS.createLongPressController({
    onShortPress: () => activateQuickReply(reply, config),
    onLongPress: () => {
      clickGuard.suppress();
      activateQuickReply(longPressReply, config);
    }
  });

  if (!controller) {
    button.addEventListener('mousedown', (event) => {
      if (isTrustedUserEvent(event)) event.preventDefault();
    });
    button.addEventListener('click', (event) => {
      event.preventDefault();
      if (!isTrustedUserEvent(event)) return;
      if (!isDragging) activateQuickReply(reply, config);
    });
    return;
  }

  const endPress = (event) => {
    if (!isTrustedUserEvent(event)) return;
    if (!pressInProgress) return;
    pressInProgress = false;
    button.classList.remove('cqr-long-pressing');
    if (controller.end() !== null) clickGuard.suppress();
  };

  button.addEventListener('mousedown', (event) => {
    if (!isTrustedUserEvent(event) || event.button !== 0 || isDragging) return;
    event.preventDefault();
    pressInProgress = true;
    clickGuard.reset();
    button.classList.add('cqr-long-pressing');
    controller.start();
    const releaseTarget = typeof window !== 'undefined' ? window : button;
    releaseTarget.addEventListener('mouseup', endPress, { once: true });
  });

  button.addEventListener('mouseleave', (event) => {
    if (!isTrustedUserEvent(event)) return;
    if (!pressInProgress) return;
    pressInProgress = false;
    button.classList.remove('cqr-long-pressing');
    if (controller.cancel()) clickGuard.suppress();
  });

  button.addEventListener('click', (event) => {
    event.preventDefault();
    if (!isTrustedUserEvent(event)) return;
    if (isDragging || clickGuard.consume()) return;
    activateQuickReply(reply, config);
  });
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
let positionObserver = null, observedPositionTargets = [], repositionFrame = null, syncFrame = null;
let armIdleFade = null;
let profileMenuEl = null, profileMenuTriggerEl = null;
let overflowMenuEl = null, overflowMenuTriggerEl = null;
let previewHostEl = null, previewTimer = null;
let commandPaletteEl = null, commandPaletteInputEl = null, commandPaletteResultsEl = null;
let commandPaletteConfig = null, commandPaletteResults = [], commandPaletteActiveIndex = 0;
let smartReplies = [];
let templateDialogEl = null, templateFormEl = null, templateTitleEl = null;
let templateReply = null, templateConfig = null, templateVariableNames = [];
let saveDialogEl = null, saveFormEl = null, saveSubtitleEl = null;
let saveConfig = null;

function haveSameReplies(left, right) {
  return left.length === right.length && left.every((reply, index) => (
    reply.label === right[index].label && reply.text === right[index].text
  ));
}

function refreshToolbarForSmartReplies() {
  if (!panelEl || !currentConfig || !panelEl.parentNode) return;
  const wasVisible = panelEl.classList.contains('cqr-visible');
  const replacement = buildToolbar({ ...currentConfig, smartReplies });
  panelEl.parentNode.replaceChild(replacement, panelEl);
  panelEl = replacement;
  if (wasVisible) panelEl.classList.add('cqr-visible');
}

function updateSmartReplies() {
  const nextReplies = getSmartRepliesForPage(currentConfig?.smartQuestionDetection);
  if (haveSameReplies(smartReplies, nextReplies)) return;
  smartReplies = nextReplies;
  refreshToolbarForSmartReplies();
}

function closeCommandPalette() {
  if (commandPaletteEl?.open) commandPaletteEl.close();
}

function selectCommandPaletteReply(reply) {
  const config = commandPaletteConfig;
  closeCommandPalette();
  if (reply && config) activateQuickReply(reply, config);
}

function closeTemplateVariableDialog() {
  if (templateDialogEl?.open) templateDialogEl.close();
}

function closeSavePromptDialog() {
  if (saveDialogEl?.open) saveDialogEl.close();
}

function suggestReplyLabel(text) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const words = cleaned.split(' ').slice(0, 3).join(' ');
  return words.length > 22 ? words.slice(0, 22).trim() : words;
}

function saveQuickReplyToActiveProfile(reply, config) {
  const activeId = config?.activeProfile;
  const profiles = config?.profiles;
  if (!activeId || !profiles?.[activeId]) return false;
  const text = typeof reply?.text === 'string' ? reply.text.trim() : '';
  if (!text) return false;
  const emoji = typeof reply?.emoji === 'string' && reply.emoji.trim() ? reply.emoji.trim() : '✨';
  const label = typeof reply?.label === 'string' && reply.label.trim() ? reply.label.trim() : suggestReplyLabel(text) || 'Saved';

  const nextProfiles = Object.assign({}, profiles, {
    [activeId]: {
      ...profiles[activeId],
      quickReplies: [...(profiles[activeId].quickReplies || []), { emoji, label, text }]
    }
  });

  if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    chrome.storage.sync.set({
      activeProfile: activeId,
      profiles: nextProfiles,
      quickReplies: nextProfiles[activeId].quickReplies
    });
    return true;
  }
  return false;
}

function createSavePromptDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'cqr-save-dialog';
  dialog.setAttribute('aria-labelledby', 'cqr-save-title');
  dialog.setAttribute('closedby', 'closerequest');
  dialog.addEventListener('pointerdown', (event) => {
    if (isTrustedUserEvent(event) && isBackdropClick(event, dialog)) closeSavePromptDialog();
  });

  const header = document.createElement('header');
  header.className = 'cqr-template-header';
  const title = document.createElement('h2');
  title.id = 'cqr-save-title';
  title.textContent = 'Save quick reply';
  header.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'cqr-template-copy';
  subtitle.textContent = 'Save this prompt to your active profile.';

  const form = document.createElement('form');
  form.className = 'cqr-template-form';

  const row = document.createElement('div');
  row.className = 'cqr-save-row';

  const emojiField = document.createElement('div');
  emojiField.className = 'cqr-template-field';
  const emojiLabel = document.createElement('label');
  emojiLabel.htmlFor = 'cqr-save-emoji';
  emojiLabel.textContent = 'Emoji';
  const emojiInput = document.createElement('input');
  emojiInput.id = 'cqr-save-emoji';
  emojiInput.name = 'emoji';
  emojiInput.type = 'text';
  emojiInput.value = '✨';
  emojiField.append(emojiLabel, emojiInput);

  const labelField = document.createElement('div');
  labelField.className = 'cqr-template-field';
  const labelLabel = document.createElement('label');
  labelLabel.htmlFor = 'cqr-save-label';
  labelLabel.textContent = 'Label';
  const labelInput = document.createElement('input');
  labelInput.id = 'cqr-save-label';
  labelInput.name = 'label';
  labelInput.type = 'text';
  labelInput.required = true;
  labelInput.placeholder = 'e.g. Code review';
  labelField.append(labelLabel, labelInput);
  row.append(emojiField, labelField);

  const textField = document.createElement('div');
  textField.className = 'cqr-template-field';
  const textLabel = document.createElement('label');
  textLabel.htmlFor = 'cqr-save-text';
  textLabel.textContent = 'Prompt text (supports {{topic}} and {{selection}})';
  const textArea = document.createElement('textarea');
  textArea.id = 'cqr-save-text';
  textArea.name = 'text';
  textArea.required = true;
  textArea.placeholder = 'Write or paste your reusable prompt...';
  textField.append(textLabel, textArea);

  const actions = document.createElement('div');
  actions.className = 'cqr-template-actions';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'cqr-template-cancel';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', (event) => {
    if (isTrustedUserEvent(event)) closeSavePromptDialog();
  });
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'cqr-template-submit';
  submit.textContent = 'Save reply';
  actions.append(cancel, submit);

  form.append(row, textField, actions);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!isTrustedUserEvent(event)) return;
    if (!form.reportValidity()) return;
    const saved = saveQuickReplyToActiveProfile({
      emoji: form.elements.emoji.value,
      label: form.elements.label.value,
      text: form.elements.text.value
    }, saveConfig);
    if (saved) closeSavePromptDialog();
  });

  dialog.addEventListener('close', () => {
    saveConfig = null;
    armIdleFade?.();
  });

  dialog.append(header, subtitle, form);
  document.body.appendChild(dialog);
  saveDialogEl = dialog;
  saveFormEl = form;
  saveSubtitleEl = subtitle;
}

function openSavePromptDialog(config) {
  if (!config?.profiles || isModalOpenOnPage()) return false;
  if (!saveDialogEl) createSavePromptDialog();
  if (!saveDialogEl || !saveFormEl || !saveSubtitleEl) return false;

  saveConfig = config;
  const activeProfile = config.profiles[config.activeProfile];
  saveSubtitleEl.textContent = activeProfile
    ? `Save to ${activeProfile.icon || '💬'} ${activeProfile.name || config.activeProfile}`
    : 'Save this prompt to your active profile.';

  const currentText = getInputText();
  saveFormEl.elements.emoji.value = '✨';
  saveFormEl.elements.text.value = currentText;
  saveFormEl.elements.label.value = suggestReplyLabel(currentText);

  if (!saveDialogEl.open) saveDialogEl.showModal();
  const focusTarget = currentText ? saveFormEl.elements.label : saveFormEl.elements.text;
  focusTarget.focus({ preventScroll: true });
  return true;
}

function createTemplateVariableDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'cqr-template-dialog';
  dialog.setAttribute('aria-labelledby', 'cqr-template-title');
  // Manual light-dismiss instead of closedby="any": native light dismiss also fires on
  // the click trailing a mouseup activation (e.g. a long-press reply), which would
  // flash this dialog open and immediately closed in one gesture. Dismiss on
  // pointerdown so a press that starts inside the dialog cannot close it.
  dialog.setAttribute('closedby', 'closerequest');
  dialog.addEventListener('pointerdown', (event) => {
    if (isTrustedUserEvent(event) && isBackdropClick(event, dialog)) closeTemplateVariableDialog();
  });

  const header = document.createElement('header');
  header.className = 'cqr-template-header';
  const title = document.createElement('h2');
  title.id = 'cqr-template-title';
  header.appendChild(title);

  const copy = document.createElement('p');
  copy.className = 'cqr-template-copy';
  copy.textContent = 'Fill in the values for this reply.';

  const form = document.createElement('form');
  form.className = 'cqr-template-form';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!isTrustedUserEvent(event)) return;
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(templateVariableNames.map((name) => [name, form.elements[name].value]));
    const resolvedReply = { ...templateReply, text: TEMPLATE_VARIABLES.renderTemplate(templateReply.text, values) };
    const config = templateConfig;
    closeTemplateVariableDialog();
    if (config) insertQuickReply(resolvedReply, config);
  });

  dialog.addEventListener('close', () => {
    templateReply = null;
    templateConfig = null;
    templateVariableNames = [];
    armIdleFade?.();
  });
  dialog.append(header, copy, form);
  document.body.appendChild(dialog);
  templateDialogEl = dialog;
  templateTitleEl = title;
  templateFormEl = form;
}

function openTemplateVariableDialog(reply, config, variables) {
  if (!reply || !config || !variables.length || isModalOpenOnPage()) return false;
  if (!templateDialogEl) createTemplateVariableDialog();
  if (!templateDialogEl || !templateFormEl || !templateTitleEl) return false;

  templateReply = reply;
  templateConfig = config;
  templateVariableNames = variables;
  templateTitleEl.textContent = reply.label ? `Complete ${reply.label}` : 'Complete template';
  templateFormEl.replaceChildren();

  variables.forEach((name, index) => {
    const field = document.createElement('div');
    field.className = 'cqr-template-field';
    const label = document.createElement('label');
    const input = document.createElement('input');
    const inputId = `cqr-template-${name}`;
    label.htmlFor = inputId;
    label.textContent = name;
    input.id = inputId;
    input.name = name;
    input.type = 'text';
    input.required = true;
    input.autocomplete = 'off';
    input.enterKeyHint = index === variables.length - 1 ? 'done' : 'next';
    field.append(label, input);
    templateFormEl.appendChild(field);
  });

  const actions = document.createElement('div');
  actions.className = 'cqr-template-actions';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'cqr-template-cancel';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', (event) => {
    if (isTrustedUserEvent(event)) closeTemplateVariableDialog();
  });
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'cqr-template-submit';
  submit.textContent = config.autoSend ? 'Send message' : 'Fill chat input';
  actions.append(cancel, submit);
  templateFormEl.appendChild(actions);

  if (!templateDialogEl.open) templateDialogEl.showModal();
  templateFormEl.elements[variables[0]].focus({ preventScroll: true });
  return true;
}

function isBackdropClick(event, dialog) {
  if (!event || event.target !== dialog) return false;
  const rect = dialog.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
}

function renderCommandPaletteResults() {
  if (!commandPaletteResultsEl || !commandPaletteInputEl) return;

  const searchableReplies = commandPaletteConfig?.profiles
    ? COMMAND_PALETTE.collectAllProfileReplies(
        commandPaletteConfig.profiles,
        PROFILE_PACKS.PROFILE_ORDER,
        commandPaletteConfig.activeProfile
      )
    : commandPaletteConfig?.quickReplies;

  commandPaletteResults = COMMAND_PALETTE.filterQuickReplies(
    searchableReplies,
    commandPaletteInputEl.value
  );
  commandPaletteActiveIndex = commandPaletteResults.length
    ? Math.min(Math.max(commandPaletteActiveIndex, 0), commandPaletteResults.length - 1)
    : -1;
  commandPaletteResultsEl.replaceChildren();

  if (!commandPaletteResults.length) {
    const emptyState = document.createElement('p');
    emptyState.className = 'cqr-command-empty';
    emptyState.textContent = 'No matching replies.';
    commandPaletteResultsEl.appendChild(emptyState);
    return;
  }

  commandPaletteResults.forEach((reply, index) => {
    const result = document.createElement('button');
    result.type = 'button';
    result.className = 'cqr-command-result' + (index === commandPaletteActiveIndex ? ' cqr-command-result-active' : '');
    const mainLabel = document.createElement('span');
    mainLabel.className = 'cqr-command-result-label';
    mainLabel.textContent = `${reply.emoji || '💬'} ${getReplyDisplayLabel(reply)}`;
    result.appendChild(mainLabel);
    if (reply._profileName) {
      const badge = document.createElement('span');
      badge.className = 'cqr-command-profile';
      badge.textContent = `${reply._profileIcon || '💬'} ${reply._profileName}`;
      result.appendChild(badge);
    }
    result.title = `Use ${getReplyDisplayLabel(reply)}`;
    result.addEventListener('click', (event) => {
      if (isTrustedUserEvent(event)) selectCommandPaletteReply(reply);
    });
    commandPaletteResultsEl.appendChild(result);
  });
}

function createCommandPalette() {
  const dialog = document.createElement('dialog');
  dialog.className = 'cqr-command-palette';
  dialog.setAttribute('aria-labelledby', 'cqr-command-title');
  // See the light-dismiss note in createTemplateVariableDialog.
  dialog.setAttribute('closedby', 'closerequest');
  dialog.addEventListener('pointerdown', (event) => {
    if (isTrustedUserEvent(event) && isBackdropClick(event, dialog)) closeCommandPalette();
  });

  const header = document.createElement('header');
  header.className = 'cqr-command-header';
  const title = document.createElement('h2');
  title.id = 'cqr-command-title';
  title.textContent = 'Search replies';
  const shortcut = document.createElement('span');
  shortcut.className = 'cqr-command-shortcut';
  shortcut.textContent = 'Alt+P';
  header.append(title, shortcut);

  const label = document.createElement('label');
  label.className = 'cqr-command-label';
  label.htmlFor = 'cqr-command-search';
  label.textContent = 'Search saved quick replies';
  const input = document.createElement('input');
  input.id = label.htmlFor;
  input.className = 'cqr-command-input';
  input.type = 'search';
  input.placeholder = 'Search replies across all profiles';
  input.autocomplete = 'off';
  input.spellcheck = false;
  const results = document.createElement('div');
  results.className = 'cqr-command-results';

  input.addEventListener('input', () => {
    commandPaletteActiveIndex = 0;
    renderCommandPaletteResults();
  });
  input.addEventListener('keydown', (event) => {
    if (!isTrustedUserEvent(event)) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      commandPaletteActiveIndex = COMMAND_PALETTE.getNextActiveIndex(
        commandPaletteActiveIndex,
        commandPaletteResults.length,
        event.key === 'ArrowDown' ? 1 : -1
      );
      renderCommandPaletteResults();
    } else if (event.key === 'Enter' && commandPaletteResults[commandPaletteActiveIndex]) {
      event.preventDefault();
      selectCommandPaletteReply(commandPaletteResults[commandPaletteActiveIndex]);
    }
  });
  dialog.addEventListener('close', () => {
    commandPaletteConfig = null;
    commandPaletteResults = [];
    commandPaletteActiveIndex = 0;
    armIdleFade?.();
  });
  dialog.append(header, label, input, results);
  document.body.appendChild(dialog);
  commandPaletteEl = dialog;
  commandPaletteInputEl = input;
  commandPaletteResultsEl = results;
}

function openCommandPalette(config = currentConfig) {
  if (!config?.quickReplies?.length || isModalOpenOnPage()) return;
  if (!commandPaletteEl) createCommandPalette();
  if (!commandPaletteEl || !commandPaletteInputEl) return;

  commandPaletteConfig = config;
  commandPaletteActiveIndex = 0;
  commandPaletteInputEl.value = '';
  renderCommandPaletteResults();
  if (!commandPaletteEl.open) commandPaletteEl.showModal();
  commandPaletteInputEl.focus({ preventScroll: true });
}

function mergeDefaultReplies(replies, defaultReplies, limit = MAX_INCLUDED_DEFAULT_REPLIES) {
  const merged = [...(replies || [])];
  const seen = new Set(merged.map((r) => r?.text));
  let added = 0;
  for (const reply of defaultReplies || []) {
    if (added >= limit) break;
    if (seen.has(reply?.text)) continue;
    seen.add(reply?.text);
    merged.push(reply);
    added += 1;
  }
  return merged;
}

function loadConfig() {
  return new Promise((res) => {
    chrome.storage.sync.get(
      { activeProfile: 'general', profiles: DEFAULT_PROFILES, quickReplies: null, autoSend: false, toolbarEnabled: true, compactToolbar: false, siteEnabled: {}, smartQuestionDetection: false, timeSavedTracking: true, includeDefaultReplies: false, toolbarFadeEnabled: true, toolbarFadeSeconds: DEFAULT_FADE_DELAY_SECONDS, onboardingCompleted: false },
      (cfg) => {
        const resolveWithProfiles = (storedProfiles) => {
          const mergedProfiles = Object.assign({}, DEFAULT_PROFILES, storedProfiles || {});
          const active = mergedProfiles[cfg.activeProfile] ? cfg.activeProfile : 'general';
          const baseReplies = mergedProfiles[active]?.quickReplies || cfg.quickReplies || DEFAULT_PROFILES.general.quickReplies;
          const generalReplies = mergedProfiles.general?.quickReplies || DEFAULT_PROFILES.general.quickReplies;
          const currentReplies = cfg.includeDefaultReplies === true && active !== 'general'
            ? mergeDefaultReplies(baseReplies, generalReplies)
            : baseReplies;
          res({
            activeProfile: active,
            profiles: mergedProfiles,
            quickReplies: currentReplies,
            autoSend: cfg.autoSend,
            smartQuestionDetection: cfg.smartQuestionDetection === true,
            timeSavedTracking: cfg.timeSavedTracking !== false,
            toolbarEnabled: isToolbarEnabledForSite(cfg.toolbarEnabled, cfg.siteEnabled),
            compactToolbar: cfg.compactToolbar === true,
            toolbarFadeEnabled: cfg.toolbarFadeEnabled !== false,
            toolbarFadeSeconds: normalizeFadeDelay(cfg.toolbarFadeSeconds),
            onboardingCompleted: cfg.onboardingCompleted === true
          });
        };

        if (chrome.storage?.local?.get) {
          chrome.storage.local.get({ profilesLocalFallback: null }, (localRes) => {
            resolveWithProfiles(localRes?.profilesLocalFallback || cfg.profiles);
          });
        } else {
          resolveWithProfiles(cfg.profiles);
        }
      }
    );
  });
}

function getSitePositionKey() {
  const provider = getProvider();
  if (provider) return provider.id;
  const host = (typeof location !== 'undefined' && location.hostname ? location.hostname : '').toLowerCase();
  return host || null;
}

function normalizePosition(position) {
  if (!position || !Number.isFinite(position.left) || !Number.isFinite(position.top)) return null;
  const normalized = { left: position.left, top: position.top };
  ['viewportWidth', 'viewportHeight', 'panelWidth', 'panelHeight'].forEach((key) => {
    if (Number.isFinite(position[key])) normalized[key] = position[key];
  });
  return normalized;
}

function getStoredSitePosition(positions, siteKey = getSitePositionKey()) {
  if (!siteKey || !positions || typeof positions !== 'object') return null;
  return normalizePosition(positions[siteKey]);
}

function getPositionStorageArea() {
  return typeof chrome !== 'undefined' ? chrome.storage?.local || null : null;
}

function readToolbarPositions() {
  const storage = getPositionStorageArea();
  if (!storage) return Promise.resolve({});

  return new Promise((resolve) => {
    storage.get({ [POSITION_STORAGE_KEY]: {} }, (result) => {
      const positions = result?.[POSITION_STORAGE_KEY];
      resolve(positions && typeof positions === 'object' ? positions : {});
    });
  });
}

async function loadToolbarPosition() {
  const positions = await readToolbarPositions();
  return getStoredSitePosition(positions);
}

async function saveToolbarPosition(position) {
  const storage = getPositionStorageArea();
  const siteKey = getSitePositionKey();
  const normalized = normalizePosition(position);
  if (!storage || !siteKey || !normalized) return false;

  const positions = await readToolbarPositions();
  return new Promise((resolve) => {
    storage.set(
      { [POSITION_STORAGE_KEY]: { ...positions, [siteKey]: normalized } },
      () => resolve(true)
    );
  });
}

async function clearToolbarPosition() {
  const storage = getPositionStorageArea();
  const siteKey = getSitePositionKey();
  if (!storage || !siteKey) return false;

  const positions = await readToolbarPositions();
  if (!(siteKey in positions)) return true;

  const nextPositions = { ...positions };
  delete nextPositions[siteKey];
  return new Promise((resolve) => {
    storage.set({ [POSITION_STORAGE_KEY]: nextPositions }, () => resolve(true));
  });
}

function normalizeFadeDelay(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 1) return DEFAULT_FADE_DELAY_SECONDS;
  return Math.min(Math.round(seconds), 60);
}

function setupIdleFade(bar, config) {
  armIdleFade = null;
  if (!bar || config?.toolbarFadeEnabled !== true) return;
  const delayMs = normalizeFadeDelay(config.toolbarFadeSeconds) * 1000;
  let fadeTimer = null;
  let fadeObserver = null;

  const clearFadeTimer = () => {
    if (fadeTimer !== null) {
      clearTimeout(fadeTimer);
      fadeTimer = null;
    }
  };
  const wake = () => {
    clearFadeTimer();
    bar.classList.remove('cqr-faded');
  };
  const arm = () => {
    clearFadeTimer();
    if (!bar.classList.contains('cqr-visible')) return;
    fadeTimer = setTimeout(() => {
      fadeTimer = null;
      if (!bar.isConnected) {
        fadeObserver?.disconnect();
        return;
      }
      if (commandPaletteEl?.open || templateDialogEl?.open || saveDialogEl?.open || profileMenuEl || overflowMenuEl) return;
      if (bar.classList.contains('cqr-dragging') || bar.matches(':hover') || bar.contains(document.activeElement)) {
        arm();
        return;
      }
      bar.classList.add('cqr-faded');
    }, delayMs);
  };
  armIdleFade = arm;

  bar.addEventListener('pointerenter', wake);
  bar.addEventListener('pointerdown', wake);
  bar.addEventListener('focusin', wake);
  bar.addEventListener('pointerleave', arm);
  bar.addEventListener('focusout', () => {
    if (!bar.contains(document.activeElement)) arm();
  });

  // cqr-visible is re-added on every sync, so watch the class attribute
  // rather than the call sites: only a real transition re-arms the timer.
  if (typeof MutationObserver !== 'undefined') {
    let wasVisible = bar.classList.contains('cqr-visible');
    fadeObserver = new MutationObserver(() => {
      if (!bar.isConnected) {
        fadeObserver.disconnect();
        clearFadeTimer();
        return;
      }
      const isVisible = bar.classList.contains('cqr-visible');
      if (isVisible === wasVisible) return;
      wasVisible = isVisible;
      if (isVisible) arm();
      else wake();
    });
    fadeObserver.observe(bar, { attributes: true, attributeFilter: ['class'] });
  }
}

function clampNumber(value, min, max) {
  if (max < min) return min;
  return Math.max(min, Math.min(max, value));
}

function getResponsivePosition(position, panelWidth, panelHeight, viewportWidth, viewportHeight) {
  if (!position) return null;
  const sourceViewportWidth = Number.isFinite(position.viewportWidth) ? position.viewportWidth : viewportWidth;
  const sourceViewportHeight = Number.isFinite(position.viewportHeight) ? position.viewportHeight : viewportHeight;
  const sourcePanelWidth = Number.isFinite(position.panelWidth) ? position.panelWidth : panelWidth;
  const sourcePanelHeight = Number.isFinite(position.panelHeight) ? position.panelHeight : panelHeight;

  const sourceXTravel = Math.max(0, sourceViewportWidth - sourcePanelWidth - 16);
  const sourceYTravel = Math.max(0, sourceViewportHeight - sourcePanelHeight - 16);
  const targetXTravel = Math.max(0, viewportWidth - panelWidth - 16);
  const targetYTravel = Math.max(0, viewportHeight - panelHeight - 16);
  const xRatio = sourceXTravel > 0 ? clampNumber((position.left - 8) / sourceXTravel, 0, 1) : 0;
  const yRatio = sourceYTravel > 0 ? clampNumber((position.top - 8) / sourceYTravel, 0, 1) : 0;

  return {
    left: clampNumber(8 + xRatio * targetXTravel, 8, viewportWidth - panelWidth - 8),
    top: clampNumber(8 + yRatio * targetYTravel, 8, viewportHeight - panelHeight - 8)
  };
}

function setupDraggable(el, handleEl = el) {
  let startX = 0, startY = 0, initLeft = 0, initTop = 0, hasMoved = false;

  el.addEventListener('pointerdown', (e) => {
    if (!isTrustedUserEvent(e) || e.button !== 0) return;
    const canStartDrag = typeof handleEl === 'function'
      ? handleEl(e.target)
      : !handleEl || e.target === handleEl || handleEl.contains?.(e.target);
    if (!canStartDrag) return;
    startX = e.clientX;
    startY = e.clientY;
    hasMoved = false;

    const r = el.getBoundingClientRect ? el.getBoundingClientRect() : { left: 0, top: 0 };
    initLeft = r.left;
    initTop = r.top;

    const onPointerMove = (m) => {
      if (!isTrustedUserEvent(m)) return;
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
      const newL = clampNumber(initLeft + dx, 8, winW - pw - 8);
      const newT = clampNumber(initTop + dy, 8, winH - ph - 8);
      customPosition = { left: newL, top: newT };
      el.style.left = Math.round(newL) + 'px';
      el.style.top = Math.round(newT) + 'px';
    };

    const onPointerUp = (event) => {
      if (!isTrustedUserEvent(event)) return;
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      }
      if (hasMoved) {
        el.classList.remove('cqr-dragging');
        void saveToolbarPosition({
          ...customPosition,
          viewportWidth: typeof window !== 'undefined' ? window.innerWidth : undefined,
          viewportHeight: typeof window !== 'undefined' ? window.innerHeight : undefined,
          panelWidth: el.offsetWidth,
          panelHeight: el.offsetHeight
        });
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
  return clearToolbarPosition();
}

function getOrderedProfileIds(profiles) {
  if (!profiles || typeof profiles !== 'object') return [];
  return [
    ...PROFILE_PACKS.PROFILE_ORDER.filter((id) => Boolean(profiles[id])),
    ...Object.keys(profiles).filter((id) => !PROFILE_PACKS.PROFILE_ORDER.includes(id) && Boolean(profiles[id]))
  ];
}

function closeProfileMenu() {
  if (profileMenuEl) {
    profileMenuEl.remove();
    profileMenuEl = null;
  }
  if (profileMenuTriggerEl) {
    profileMenuTriggerEl.setAttribute('aria-expanded', 'false');
    profileMenuTriggerEl = null;
  }
  armIdleFade?.();
}

function switchActiveProfile(profileId, config) {
  const targetProfile = config?.profiles?.[profileId];
  if (!targetProfile) return false;
  closeProfileMenu();
  if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    chrome.storage.sync.set({
      activeProfile: profileId,
      quickReplies: targetProfile.quickReplies,
      onboardingCompleted: true
    });
    return true;
  }
  return false;
}

function openProfileMenu(triggerBtn, config) {
  if (!triggerBtn || !config?.profiles || isModalOpenOnPage()) return;
  if (profileMenuEl) {
    const isSameTrigger = profileMenuTriggerEl === triggerBtn;
    closeProfileMenu();
    if (isSameTrigger) return;
  }

  const profileIds = getOrderedProfileIds(config.profiles);
  if (profileIds.length < 2 || !document.body) return;

  const menu = document.createElement('div');
  menu.className = 'cqr-profile-menu' + (panelEl?.classList.contains('cqr-dark') ? ' cqr-dark' : '');
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Switch quick reply profile');

  profileIds.forEach((id) => {
    const profile = config.profiles[id];
    const isActive = id === config.activeProfile;
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'cqr-profile-option' + (isActive ? ' cqr-profile-option-active' : '');
    item.setAttribute('role', 'menuitemradio');
    item.setAttribute('aria-checked', String(isActive));

    const labelSpan = document.createElement('span');
    labelSpan.textContent = `${profile.icon || '💬'} ${profile.name || id}`;
    item.appendChild(labelSpan);

    if (isActive) {
      const check = document.createElement('span');
      check.className = 'cqr-profile-check';
      check.textContent = '✓';
      check.setAttribute('aria-hidden', 'true');
      item.appendChild(check);
    }

    item.addEventListener('mousedown', (e) => {
      if (isTrustedUserEvent(e)) e.preventDefault();
    });
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isTrustedUserEvent(e)) return;
      switchActiveProfile(id, config);
    });
    menu.appendChild(item);
  });

  document.body.appendChild(menu);
  profileMenuEl = menu;
  profileMenuTriggerEl = triggerBtn;
  triggerBtn.setAttribute('aria-expanded', 'true');

  if (triggerBtn.getBoundingClientRect && menu.getBoundingClientRect) {
    const tr = triggerBtn.getBoundingClientRect();
    const mr = menu.getBoundingClientRect();
    const winW = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const left = Math.max(8, Math.min(winW - mr.width - 8, tr.left));
    const aboveTop = tr.top - mr.height - 8;
    const top = aboveTop >= 8 ? aboveTop : Math.min(winH - mr.height - 8, tr.bottom + 8);
    menu.style.left = Math.round(left) + 'px';
    menu.style.top = Math.round(top) + 'px';
  }

  const onOutsidePointer = (event) => {
    if (!profileMenuEl) {
      document.removeEventListener('pointerdown', onOutsidePointer, true);
      document.removeEventListener('keydown', onEscape, true);
      return;
    }
    if (profileMenuEl.contains(event.target) || triggerBtn.contains(event.target)) return;
    closeProfileMenu();
    document.removeEventListener('pointerdown', onOutsidePointer, true);
    document.removeEventListener('keydown', onEscape, true);
  };
  const onEscape = (event) => {
    if (event.key === 'Escape' && isTrustedUserEvent(event)) {
      closeProfileMenu();
      document.removeEventListener('pointerdown', onOutsidePointer, true);
      document.removeEventListener('keydown', onEscape, true);
    }
  };
  document.addEventListener('pointerdown', onOutsidePointer, true);
  document.addEventListener('keydown', onEscape, true);
}

function closeOverflowMenu() {
  if (overflowMenuEl) {
    overflowMenuEl.remove();
    overflowMenuEl = null;
  }
  if (overflowMenuTriggerEl) {
    overflowMenuTriggerEl.setAttribute('aria-expanded', 'false');
    overflowMenuTriggerEl = null;
  }
  armIdleFade?.();
}

function openOverflowMenu(triggerBtn, replies, config) {
  if (!triggerBtn || !replies?.length || isModalOpenOnPage()) return;
  if (overflowMenuEl) {
    const isSameTrigger = overflowMenuTriggerEl === triggerBtn;
    closeOverflowMenu();
    if (isSameTrigger) return;
  }
  closeProfileMenu();
  if (!document.body) return;

  const menu = document.createElement('div');
  menu.className = 'cqr-profile-menu cqr-overflow-menu' + (panelEl?.classList.contains('cqr-dark') ? ' cqr-dark' : '');
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'More quick replies');

  replies.forEach((reply) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'cqr-profile-option';
    item.setAttribute('role', 'menuitem');
    item.textContent = `${reply.emoji || '💬'} ${getReplyDisplayLabel(reply)}`;
    item.title = `${config?.autoSend ? 'Send' : 'Fill'} ${getReplyDisplayLabel(reply)}`;
    item.addEventListener('mousedown', (e) => {
      if (isTrustedUserEvent(e)) e.preventDefault();
    });
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isTrustedUserEvent(e)) return;
      closeOverflowMenu();
      activateQuickReply(reply, config);
    });
    menu.appendChild(item);
  });

  document.body.appendChild(menu);
  overflowMenuEl = menu;
  overflowMenuTriggerEl = triggerBtn;
  triggerBtn.setAttribute('aria-expanded', 'true');

  if (triggerBtn.getBoundingClientRect && menu.getBoundingClientRect) {
    const tr = triggerBtn.getBoundingClientRect();
    const mr = menu.getBoundingClientRect();
    const winW = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const left = Math.max(8, Math.min(winW - mr.width - 8, tr.right - mr.width));
    const aboveTop = tr.top - mr.height - 8;
    const top = aboveTop >= 8 ? aboveTop : Math.min(winH - mr.height - 8, tr.bottom + 8);
    menu.style.left = Math.round(left) + 'px';
    menu.style.top = Math.round(top) + 'px';
  }

  const onOutsidePointer = (event) => {
    if (!overflowMenuEl) {
      document.removeEventListener('pointerdown', onOutsidePointer, true);
      document.removeEventListener('keydown', onEscape, true);
      return;
    }
    if (overflowMenuEl.contains(event.target) || triggerBtn.contains(event.target)) return;
    closeOverflowMenu();
    document.removeEventListener('pointerdown', onOutsidePointer, true);
    document.removeEventListener('keydown', onEscape, true);
  };
  const onEscape = (event) => {
    if (event.key === 'Escape' && isTrustedUserEvent(event)) {
      closeOverflowMenu();
      document.removeEventListener('pointerdown', onOutsidePointer, true);
      document.removeEventListener('keydown', onEscape, true);
    }
  };
  document.addEventListener('pointerdown', onOutsidePointer, true);
  document.addEventListener('keydown', onEscape, true);
}

function fitToolbarToWidth(bar, maxWidth) {
  if (!bar || isToolbarCollapsed || !bar._replyItems?.length || !bar._overflowBtn) return;
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) return;

  const items = bar._replyItems;
  const overflowBtn = bar._overflowBtn;
  items.forEach(({ btn }) => btn.classList.remove('cqr-overflow-hidden'));
  overflowBtn.classList.add('cqr-overflow-hidden');
  bar._overflowReplies = [];

  const measureWidth = () => bar.scrollWidth || bar.offsetWidth || 0;
  if (measureWidth() <= maxWidth) return;

  overflowBtn.textContent = '+9 ▾';
  overflowBtn.classList.remove('cqr-overflow-hidden');

  const hiddenReplies = [];
  for (let i = items.length - 1; i >= 1; i -= 1) {
    if (measureWidth() <= maxWidth) break;
    items[i].btn.classList.add('cqr-overflow-hidden');
    hiddenReplies.unshift(items[i].reply);
  }

  if (!hiddenReplies.length) {
    overflowBtn.classList.add('cqr-overflow-hidden');
    return;
  }

  bar._overflowReplies = hiddenReplies;
  const count = hiddenReplies.length;
  overflowBtn.textContent = `+${count} ▾`;
  overflowBtn.title = `${count} more quick ${count === 1 ? 'reply' : 'replies'}`;
  overflowBtn.setAttribute('aria-label', `Show ${count} more quick ${count === 1 ? 'reply' : 'replies'}`);
}

function hideReplyPreview() {
  if (previewTimer !== null) {
    clearTimeout(previewTimer);
    previewTimer = null;
  }
  if (previewHostEl) {
    previewHostEl.remove();
    previewHostEl = null;
  }
}

function showReplyPreview(button, reply, shortcut, hasLongPress) {
  hideReplyPreview();
  if (!button || !reply || isDragging || profileMenuEl || overflowMenuEl || !document.body) return;
  if (typeof button.getBoundingClientRect !== 'function') return;

  const isDark = Boolean(panelEl?.classList?.contains('cqr-dark'));
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';

  const root = typeof host.attachShadow === 'function' ? host.attachShadow({ mode: 'closed' }) : host;
  const style = document.createElement('style');
  style.textContent = `
    .card {
      max-width: 280px;
      padding: 8px 10px;
      border-radius: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
      background: ${isDark ? 'rgba(22, 22, 26, 0.96)' : 'rgba(255, 255, 255, 0.97)'};
      color: ${isDark ? '#f1f5f9' : '#0f172a'};
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.12)'};
      box-shadow: ${isDark ? '0 12px 30px rgba(0, 0, 0, 0.55)' : '0 10px 26px rgba(15, 23, 42, 0.18)'};
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-sizing: border-box;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 11.5px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .kbd {
      font-size: 9.5px;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 4px;
      background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9'};
      color: ${isDark ? '#cbd5e1' : '#475569'};
      flex-shrink: 0;
    }
    .body {
      font-size: 11px;
      line-height: 1.4;
      color: ${isDark ? '#cbd5e1' : '#334155'};
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
    }
    .hint {
      margin-top: 5px;
      font-size: 9.5px;
      color: ${isDark ? '#86efac' : '#15803d'};
      font-weight: 600;
    }
  `;

  const card = document.createElement('div');
  card.className = 'card';

  const head = document.createElement('div');
  head.className = 'head';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = `${reply.emoji || '💬'} ${getReplyDisplayLabel(reply)}`;
  head.appendChild(titleSpan);
  if (shortcut) {
    const kbd = document.createElement('span');
    kbd.className = 'kbd';
    kbd.textContent = shortcut;
    head.appendChild(kbd);
  }
  card.appendChild(head);

  const body = document.createElement('div');
  body.className = 'body';
  body.textContent = typeof reply.text === 'string' ? reply.text : '';
  card.appendChild(body);

  if (hasLongPress) {
    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = 'Hold for expanded reply';
    card.appendChild(hint);
  }

  root.appendChild(style);
  root.appendChild(card);
  document.body.appendChild(host);
  previewHostEl = host;

  const br = button.getBoundingClientRect();
  const hr = host.getBoundingClientRect ? host.getBoundingClientRect() : { width: 240, height: 68 };
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const left = Math.max(8, Math.min(winW - hr.width - 8, br.left + (br.width - hr.width) / 2));
  const aboveTop = br.top - hr.height - 8;
  const top = aboveTop >= 8 ? aboveTop : Math.min(winH - hr.height - 8, br.bottom + 8);
  host.style.left = Math.round(left) + 'px';
  host.style.top = Math.round(top) + 'px';
}

function attachReplyPreview(button, reply, shortcut, hasLongPress) {
  button.addEventListener('pointerenter', (event) => {
    if (!isTrustedUserEvent(event) || isDragging) return;
    hideReplyPreview();
    previewTimer = setTimeout(() => {
      previewTimer = null;
      showReplyPreview(button, reply, shortcut, hasLongPress);
    }, 180);
  });
  button.addEventListener('pointerleave', hideReplyPreview);
  button.addEventListener('pointerdown', hideReplyPreview);
  button.addEventListener('blur', hideReplyPreview);
}

function buildToolbar(config) {
  const bar = document.createElement('div');
  bar.className = 'cqr-toolbar'
    + (isToolbarCollapsed ? ' cqr-collapsed' : '')
    + (config.compactToolbar ? ' cqr-compact' : '');

  const handle = document.createElement('span');
  handle.className = 'cqr-drag-handle';
  handle.textContent = '⠿';
  handle.title = 'Drag to move toolbar';
  bar.appendChild(handle);

  const profileIds = getOrderedProfileIds(config.profiles);
  if (profileIds.length > 1) {
    const activeId = config.activeProfile && config.profiles[config.activeProfile] ? config.activeProfile : profileIds[0];
    const activeProfileObj = config.profiles[activeId];
    const profileBtn = document.createElement('button');
    profileBtn.type = 'button';
    const showFirstRunHint = config.onboardingCompleted === false;
    profileBtn.className = 'cqr-btn cqr-profile-btn' + (showFirstRunHint ? ' cqr-smart-reply-btn' : '');
    profileBtn.textContent = showFirstRunHint
      ? `${activeProfileObj?.icon || '💬'} Pick pack ▾`
      : `${activeProfileObj?.icon || '💬'} ▾`;
    profileBtn.title = `Switch profile (${activeProfileObj?.name || activeId})`;
    profileBtn.setAttribute('aria-label', `Switch profile (${activeProfileObj?.name || activeId})`);
    profileBtn.setAttribute('aria-haspopup', 'menu');
    profileBtn.setAttribute('aria-expanded', 'false');
    profileBtn.addEventListener('mousedown', (e) => {
      if (isTrustedUserEvent(e)) e.preventDefault();
    });
    profileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isTrustedUserEvent(e)) return;
      if (!isDragging) openProfileMenu(profileBtn, config);
    });
    bar.appendChild(profileBtn);
  }

  const replyItems = [];
  config.quickReplies.forEach((r, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cqr-btn cqr-reply-btn';
    btn.textContent = config.compactToolbar ? (r.emoji || '💬') : `${r.emoji} ${getReplyDisplayLabel(r)}`;
    if (config.compactToolbar) btn.setAttribute('aria-label', getReplyDisplayLabel(r));
    const shortcut = index < 9 ? `Alt+${index + 1}` : null;
    const longPressReply = LONG_PRESS.getLongPressReply(r);
    btn.title = getReplyButtonTitle(r, config, index, Boolean(longPressReply));
    if (shortcut) btn.setAttribute('aria-keyshortcuts', shortcut);
    addQuickReplyInteraction(btn, r, config);
    attachReplyPreview(btn, r, shortcut, Boolean(longPressReply));
    bar.appendChild(btn);
    replyItems.push({ btn, reply: r });
  });
  bar._replyItems = replyItems;
  bar._overflowReplies = [];

  if (replyItems.length > 2) {
    const overflowBtn = document.createElement('button');
    overflowBtn.type = 'button';
    overflowBtn.className = 'cqr-btn cqr-overflow-btn cqr-overflow-hidden';
    overflowBtn.textContent = '+1 ▾';
    overflowBtn.setAttribute('aria-haspopup', 'menu');
    overflowBtn.setAttribute('aria-expanded', 'false');
    overflowBtn.addEventListener('mousedown', (e) => {
      if (isTrustedUserEvent(e)) e.preventDefault();
    });
    overflowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isTrustedUserEvent(e)) return;
      if (!isDragging) openOverflowMenu(overflowBtn, bar._overflowReplies, config);
    });
    bar._overflowBtn = overflowBtn;
    bar.appendChild(overflowBtn);
  }

  if (config.smartReplies?.length) {
    const smartGroup = document.createElement('span');
    smartGroup.className = 'cqr-smart-replies';
    config.smartReplies.forEach((reply) => {
      const smartBtn = document.createElement('button');
      smartBtn.type = 'button';
      smartBtn.className = 'cqr-btn cqr-reply-btn cqr-smart-reply-btn';
      smartBtn.textContent = `${reply.emoji} ${getReplyDisplayLabel(reply)}`;
      const longPressReply = LONG_PRESS.getLongPressReply(reply);
      smartBtn.title = longPressReply
        ? `Suggested from the latest assistant response — hold for: ${longPressReply.text}`
        : 'Suggested from the latest assistant response';
      smartBtn.setAttribute('aria-label', `Suggested answer: ${reply.label}`);
      addQuickReplyInteraction(smartBtn, reply, config);
      smartGroup.appendChild(smartBtn);
    });
    bar.appendChild(smartGroup);
  }

  if (config.profiles) {
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'cqr-btn cqr-save-btn';
    saveBtn.textContent = '+';
    saveBtn.title = 'Save current prompt as quick reply';
    saveBtn.setAttribute('aria-label', 'Save current prompt as quick reply');
    saveBtn.addEventListener('mousedown', (e) => {
      if (isTrustedUserEvent(e)) e.preventDefault();
    });
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isTrustedUserEvent(e)) return;
      if (!isDragging) openSavePromptDialog(config);
    });
    bar.appendChild(saveBtn);
  }

  const commandBtn = document.createElement('button');
  commandBtn.type = 'button';
  commandBtn.className = 'cqr-btn cqr-command-btn';
  commandBtn.textContent = '⌕';
  commandBtn.title = 'Search quick replies (Alt+P)';
  commandBtn.setAttribute('aria-label', 'Search quick replies');
  commandBtn.setAttribute('aria-keyshortcuts', 'Alt+P');
  commandBtn.addEventListener('mousedown', (e) => {
    if (isTrustedUserEvent(e)) e.preventDefault();
  });
  commandBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isTrustedUserEvent(e)) return;
    if (!isDragging) openCommandPalette(config);
  });
  bar.appendChild(commandBtn);

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'cqr-btn cqr-toggle-btn';
  toggleBtn.textContent = isToolbarCollapsed ? '💬 Quick Replies' : '✕';
  toggleBtn.title = isToolbarCollapsed ? 'Expand Prompticon quick replies' : 'Collapse quick replies';
  toggleBtn.setAttribute('aria-label', isToolbarCollapsed ? 'Expand quick replies' : 'Collapse quick replies');
  toggleBtn.addEventListener('mousedown', (e) => {
    if (isTrustedUserEvent(e)) e.preventDefault();
  });
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isTrustedUserEvent(e)) return;
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
  resetBtn.addEventListener('mousedown', (e) => {
    if (isTrustedUserEvent(e)) e.preventDefault();
  });
  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isTrustedUserEvent(e)) return;
    if (isDragging) return;
    resetPosition();
  });
  bar.appendChild(resetBtn);
  setupDraggable(bar, (target) => (
    target === handle
    || handle.contains?.(target)
    || (isToolbarCollapsed && (target === toggleBtn || toggleBtn.contains?.(target)))
  ));
  setupIdleFade(bar, config);

  return bar;
}

function hidePanel() {
  closeProfileMenu();
  closeOverflowMenu();
  hideReplyPreview();
  if (panelEl) panelEl.classList.remove('cqr-visible');
}

function getPanelLeft(composerRect, inputRect, panelWidth, collapsed) {
  return collapsed && inputRect
    ? inputRect.left
    : composerRect.left + (composerRect.width - panelWidth) / 2;
}

function positionPanel() {
  if (!panelEl || !currentInputEl) return false;
  if (isDragging) return true;

  const c = getComposerContainer(currentInputEl) || currentInputEl;
  const r = c.getBoundingClientRect();
  if (r.width <= 0 || r.bottom < 0 || r.top > window.innerHeight) { hidePanel(); return false; }

  const maxW = Math.min(Math.round(r.width), window.innerWidth - 24);
  panelEl.style.maxWidth = maxW + 'px';
  panelEl.style.width = 'max-content';
  fitToolbarToWidth(panelEl, maxW);

  const fittedW = panelEl.offsetWidth || panelEl.scrollWidth;
  const fittedH = panelEl.offsetHeight || 30;

  if (customPosition && fittedW > 0) {
    const hasViewportMetadata = ['viewportWidth', 'viewportHeight', 'panelWidth', 'panelHeight']
      .every((key) => Number.isFinite(customPosition[key]));
    const nextPosition = hasViewportMetadata
      ? getResponsivePosition(customPosition, fittedW, fittedH, window.innerWidth, window.innerHeight)
      : {
        left: clampNumber(customPosition.left, 8, window.innerWidth - fittedW - 8),
        top: clampNumber(customPosition.top, 8, window.innerHeight - fittedH - 8)
      };
    panelEl.style.left = Math.round(nextPosition.left) + 'px';
    panelEl.style.top = Math.round(nextPosition.top) + 'px';
    return true;
  }

  const top = r.top - fittedH - 10;
  // Grok's styled composer wrapper can be much wider than the editable field.
  // A collapsed toolbar should track the field itself on every provider.
  const inputRect = currentInputEl.getBoundingClientRect();
  const left = getPanelLeft(r, inputRect, fittedW, isToolbarCollapsed);

  panelEl.style.top = Math.round(top < 8 ? r.bottom + 10 : top) + 'px';
  panelEl.style.left = Math.round(Math.max(12, Math.min(left, window.innerWidth - fittedW - 12))) + 'px';
  return true;
}

function requestPanelFrame(callback) {
  const requestFrame = typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (frameCallback) => setTimeout(frameCallback, 16);
  return requestFrame(callback);
}

function schedulePositionPanel() {
  if (repositionFrame !== null || typeof window === 'undefined') return;
  repositionFrame = requestPanelFrame(() => {
    repositionFrame = null;
    positionPanel();
  });
}

function scheduleSyncPanel() {
  if (syncFrame !== null || typeof window === 'undefined') return;
  syncFrame = requestPanelFrame(() => {
    syncFrame = null;
    syncPanel();
  });
}

function updatePositionObserver() {
  if (!panelEl || !currentInputEl || typeof ResizeObserver === 'undefined') return;
  const composer = getComposerContainer(currentInputEl) || currentInputEl;
  const targets = [...new Set([panelEl, currentInputEl, composer])];
  const unchanged = targets.length === observedPositionTargets.length
    && targets.every((target, index) => target === observedPositionTargets[index]);
  if (unchanged) return;

  if (!positionObserver) {
    positionObserver = new ResizeObserver(() => schedulePositionPanel());
  }
  positionObserver.disconnect();
  targets.forEach((target) => positionObserver.observe(target));
  observedPositionTargets = targets;
}

function syncPanel() {
  if (isModalOpenOnPage()) { hidePanel(); return; }
  currentInputEl = getInputEl();
  if (!currentInputEl || !panelEl) { hidePanel(); return; }
  updateSmartReplies();
  applyNativeStyles();
  updatePositionObserver();
  if (positionPanel()) panelEl.classList.add('cqr-visible');
}

async function initPanel() {
  if (panelEl) return;
  currentConfig = await loadConfig();
  if (!currentConfig || !currentConfig.toolbarEnabled || !currentConfig.quickReplies || currentConfig.quickReplies.length === 0) return;
  customPosition = await loadToolbarPosition();
  if (panelEl) return;
  smartReplies = getSmartRepliesForPage(currentConfig.smartQuestionDetection);
  panelEl = buildToolbar({ ...currentConfig, smartReplies });
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
  window.addEventListener('scroll', () => { if (panelEl) scheduleSyncPanel(); }, true);
  window.addEventListener('resize', scheduleSyncPanel);
  window.visualViewport?.addEventListener('resize', scheduleSyncPanel);
  document.addEventListener('keydown', (event) => {
    if (!isTrustedUserEvent(event)) return;
    if (commandPaletteEl?.open) return;
    if (COMMAND_PALETTE.isCommandPaletteShortcut(event)) {
      if (isModalOpenOnPage()) return;
      event.preventDefault();
      openCommandPalette(currentConfig);
      return;
    }
    const reply = getShortcutReply(currentConfig, event);
    if (!reply || isModalOpenOnPage()) return;
    event.preventDefault();
    activateQuickReply(reply, currentConfig);
  }, true);

  let debounceTimer = null;
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver((mutations) => {
      const onlyToolbarMutations = mutations.every((mutation) => (
        panelEl && (mutation.target === panelEl || panelEl.contains(mutation.target))
      ));
      if (onlyToolbarMutations) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(syncPanel, 150);
    }).observe(document.body, { childList: true, subtree: true });
  }
  setInterval(syncPanel, 2000);
  if (chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        if (changes?.[POSITION_STORAGE_KEY]) {
          customPosition = getStoredSitePosition(changes[POSITION_STORAGE_KEY].newValue);
          positionPanel();
        }
        return;
      }
      if (changes?.resetPosition) {
        void resetPosition();
        return;
      }
      closeProfileMenu();
      closeOverflowMenu();
      hideReplyPreview();
      if (panelEl) {
        positionObserver?.disconnect();
        observedPositionTargets = [];
        panelEl.remove();
        panelEl = null;
      }
      currentConfig = null;
      initPanel();
    });
  }
  initPanel();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_PROFILES,
    addQuickReplyInteraction,
    DEFAULT_REPLIES,
    MAX_INCLUDED_DEFAULT_REPLIES,
    mergeDefaultReplies,
    PROVIDERS,
    getProvider,
    isToolbarEnabledForSite,
    getLatestAssistantResponseText,
    getSmartRepliesForPage,
    openCommandPalette,
    getInputEl,
    getInputText,
    getSendButton,
    setInputText,
    suggestReplyLabel,
    saveQuickReplyToActiveProfile,
    activateQuickReply,
    scoreInput,
    parseRgb,
    getLuminance,
    isTransparentColor,
    isModalOpenOnPage,
    getComposerContainer,
    getShortcutIndex,
    getShortcutReply,
    isTrustedUserEvent,
    getReplyDisplayLabel,
    getReplyButtonTitle,
    isBackdropClick,
    insertQuickReply,
    recordTimeSaved,
    loadConfig,
    getSitePositionKey,
    getStoredSitePosition,
    loadToolbarPosition,
    saveToolbarPosition,
    clearToolbarPosition,
    buildToolbar,
    fitToolbarToWidth,
    getOrderedProfileIds,
    switchActiveProfile,
    setupDraggable,
    setupIdleFade,
    getResponsivePosition,
    normalizeFadeDelay,
    DEFAULT_FADE_DELAY_SECONDS,
    resetPosition,
    getPanelLeft,
    initPanel
  };
}
