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
const { DEFAULT_PROFILES } = PROFILE_PACKS;

const DEFAULT_REPLIES = DEFAULT_PROFILES.general.quickReplies;
const POSITION_STORAGE_KEY = 'toolbarPositions';

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

  for (const selector of ASSISTANT_MESSAGE_SELECTORS) {
    const candidates = Array.from(document.querySelectorAll?.(selector) || []);
    for (let index = candidates.length - 1; index >= 0; index -= 1) {
      const candidate = candidates[index];
      if (candidate.closest?.('.cqr-toolbar, .cqr-command-palette, .cqr-template-dialog') || !isVisible(candidate)) continue;
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
  if (config.autoSend) setTimeout(() => trySend(getSendButton()), 80);
  return true;
}

function activateQuickReply(reply, config) {
  const variables = TEMPLATE_VARIABLES.getTemplateVariables(reply?.text);
  if (!variables.length) return insertQuickReply(reply, config);
  return openTemplateVariableDialog(reply, config, variables);
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
let commandPaletteEl = null, commandPaletteInputEl = null, commandPaletteResultsEl = null;
let commandPaletteConfig = null, commandPaletteResults = [], commandPaletteActiveIndex = 0;
let smartReplies = [];
let templateDialogEl = null, templateFormEl = null, templateTitleEl = null;
let templateReply = null, templateConfig = null, templateVariableNames = [];

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

function createTemplateVariableDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'cqr-template-dialog';
  dialog.setAttribute('aria-labelledby', 'cqr-template-title');
  dialog.setAttribute('closedby', 'any');
  if (!supportsDialogLightDismiss()) {
    dialog.addEventListener('click', (event) => {
      if (isBackdropClick(event, dialog)) closeTemplateVariableDialog();
    });
  }

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

function supportsDialogLightDismiss() {
  return typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;
}

function isBackdropClick(event, dialog) {
  if (!event || event.target !== dialog) return false;
  const rect = dialog.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
}

function renderCommandPaletteResults() {
  if (!commandPaletteResultsEl || !commandPaletteInputEl) return;

  commandPaletteResults = COMMAND_PALETTE.filterQuickReplies(
    commandPaletteConfig?.quickReplies,
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
    result.textContent = `${reply.emoji || '💬'} ${getReplyDisplayLabel(reply)}`;
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
  dialog.setAttribute('closedby', 'any');
  if (!supportsDialogLightDismiss()) {
    dialog.addEventListener('click', (event) => {
      if (isBackdropClick(event, dialog)) closeCommandPalette();
    });
  }

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
  input.placeholder = 'Search replies';
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

function loadConfig() {
  return new Promise((res) => {
    chrome.storage.sync.get(
      { activeProfile: 'general', profiles: DEFAULT_PROFILES, quickReplies: null, autoSend: false, toolbarEnabled: true, siteEnabled: {}, smartQuestionDetection: false },
      (cfg) => {
        const active = cfg.activeProfile || 'general';
        const profs = cfg.profiles || DEFAULT_PROFILES;
        const currentReplies = profs[active]?.quickReplies || cfg.quickReplies || DEFAULT_PROFILES.general.quickReplies;
        res({
          quickReplies: currentReplies,
          autoSend: cfg.autoSend,
          smartQuestionDetection: cfg.smartQuestionDetection === true,
          toolbarEnabled: isToolbarEnabledForSite(cfg.toolbarEnabled, cfg.siteEnabled)
        });
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
  return { left: position.left, top: position.top };
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

function setupDraggable(el) {
  let startX = 0, startY = 0, initLeft = 0, initTop = 0, hasMoved = false;

  el.addEventListener('pointerdown', (e) => {
    if (!isTrustedUserEvent(e) || e.button !== 0) return;
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
      const newL = Math.max(8, Math.min(winW - pw - 8, initLeft + dx));
      const newT = Math.max(8, Math.min(winH - ph - 8, initTop + dy));
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
        void saveToolbarPosition(customPosition);
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

function buildToolbar(config) {
  const bar = document.createElement('div');
  bar.className = 'cqr-toolbar' + (isToolbarCollapsed ? ' cqr-collapsed' : '');

  const handle = document.createElement('span');
  handle.className = 'cqr-drag-handle';
  handle.textContent = '⠿';
  handle.title = 'Drag to move toolbar';
  bar.appendChild(handle);

  config.quickReplies.forEach((r, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cqr-btn cqr-reply-btn';
    btn.textContent = `${r.emoji} ${getReplyDisplayLabel(r)}`;
    const shortcut = index < 9 ? `Alt+${index + 1}` : null;
    const longPressReply = LONG_PRESS.getLongPressReply(r);
    btn.title = getReplyButtonTitle(r, config, index, Boolean(longPressReply));
    if (shortcut) btn.setAttribute('aria-keyshortcuts', shortcut);
    addQuickReplyInteraction(btn, r, config);
    bar.appendChild(btn);
  });

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
  setupDraggable(bar);

  return bar;
}

function hidePanel() { if (panelEl) panelEl.classList.remove('cqr-visible'); }

function getPanelLeft(composerRect, inputRect, panelWidth, collapsed) {
  return collapsed && inputRect
    ? inputRect.left
    : composerRect.left + (composerRect.width - panelWidth) / 2;
}

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
  // Grok's styled composer wrapper can be much wider than the editable field.
  // A collapsed toolbar should track the field itself on every provider.
  const inputRect = currentInputEl.getBoundingClientRect();
  const left = getPanelLeft(r, inputRect, pw, isToolbarCollapsed);

  panelEl.style.top = Math.round(top < 8 ? r.bottom + 10 : top) + 'px';
  panelEl.style.left = Math.round(Math.max(12, Math.min(left, window.innerWidth - pw - 12))) + 'px';
}

function syncPanel() {
  if (isModalOpenOnPage()) { hidePanel(); return; }
  currentInputEl = getInputEl();
  if (!currentInputEl || !panelEl) { hidePanel(); return; }
  updateSmartReplies();
  applyNativeStyles();
  positionPanel();
  panelEl.classList.add('cqr-visible');
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
  window.addEventListener('scroll', () => { if (panelEl?.classList.contains('cqr-visible')) positionPanel(); }, true);
  window.addEventListener('resize', () => { if (panelEl) positionPanel(); });
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
    new MutationObserver(() => { clearTimeout(debounceTimer); debounceTimer = setTimeout(syncPanel, 150); }).observe(document.body, { childList: true, subtree: true });
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
    addQuickReplyInteraction,
    DEFAULT_REPLIES,
    PROVIDERS,
    getProvider,
    isToolbarEnabledForSite,
    getLatestAssistantResponseText,
    getSmartRepliesForPage,
    openCommandPalette,
    getInputEl,
    getSendButton,
    setInputText,
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
    loadConfig,
    getSitePositionKey,
    getStoredSitePosition,
    loadToolbarPosition,
    saveToolbarPosition,
    clearToolbarPosition,
    buildToolbar,
    setupDraggable,
    resetPosition,
    getPanelLeft,
    initPanel
  };
}
