const { SUPPORTED_SITES, normalizeSiteEnabled } = globalThis.PrompticonSiteSettings;
const { ONBOARDING_STEP_COUNT, getOnboardingStepState, shouldShowOnboarding } = globalThis.PrompticonOnboarding;
const { DEFAULT_PROFILES, PROFILE_ORDER } = globalThis.PrompticonProfilePacks;

const listEl = document.getElementById('list');
const addBtn = document.getElementById('add');
const autoSendEl = document.getElementById('autoSend');
const smartQuestionDetectionEl = document.getElementById('smartQuestionDetection');
const toolbarEnabledEl = document.getElementById('toolbarEnabled');
const siteSettingsEl = document.getElementById('siteSettings');
const siteListEl = document.getElementById('siteList');
const preferencesDialogEl = document.getElementById('preferencesDialog');
const settingsButtonEl = document.getElementById('settingsButton');
const closePreferencesButtonEl = document.getElementById('closePreferences');
const onboardingEl = document.getElementById('onboarding');
const onboardingProgressTextEl = document.getElementById('onboardingProgressText');
const onboardingStepMarkers = document.querySelectorAll('[data-onboarding-marker]');
const onboardingBackBtn = document.getElementById('onboardingBack');
const onboardingNextBtn = document.getElementById('onboardingNext');
const onboardingFinishBtn = document.getElementById('onboardingFinish');
const onboardingSkipBtn = document.getElementById('onboardingSkip');
const demoComposerEl = document.getElementById('demoComposer');
const demoSendModeEl = document.getElementById('demoSendMode');
const demoSendResultEl = document.getElementById('demoSendResult');
const profileSelectEl = document.getElementById('profileSelect');
const versionBadge = document.getElementById('versionBadge');
const saveToastEl = document.getElementById('saveToast');

if (versionBadge && typeof chrome !== 'undefined' && chrome.runtime?.getManifest) {
  versionBadge.textContent = `v${chrome.runtime.getManifest().version}`;
}

let activeProfile = 'general';
let profiles = JSON.parse(JSON.stringify(DEFAULT_PROFILES));
let onboardingStep = 0;
let replySaveTimer;
let saveToastTimer;

function setOnboardingStep(step, shouldFocus = false) {
  const state = getOnboardingStepState(step);
  onboardingStep = state.index;

  document.querySelectorAll('[data-onboarding-step]').forEach((slide) => {
    slide.hidden = Number(slide.dataset.onboardingStep) !== state.index;
  });
  onboardingProgressTextEl.textContent = `${state.number} of ${ONBOARDING_STEP_COUNT}`;
  onboardingStepMarkers.forEach((marker) => {
    marker.classList.toggle('active', Number(marker.dataset.onboardingMarker) === state.index);
  });
  onboardingBackBtn.hidden = state.isFirst;
  onboardingNextBtn.hidden = state.isLast;
  onboardingFinishBtn.hidden = !state.isLast;

  if (shouldFocus) {
    onboardingEl.querySelector(`[data-onboarding-step="${state.index}"] h2`)?.focus({ preventScroll: true });
  }
}

function showOnboarding(show) {
  if (!show) {
    if (onboardingEl.open) onboardingEl.close();
    return;
  }

  setOnboardingStep(0, true);
  if (!onboardingEl.open) onboardingEl.showModal();
}

function updateDemoSendResult() {
  demoSendResultEl.textContent = demoSendModeEl.checked
    ? 'Send now: a reply is inserted and submitted immediately.'
    : 'Fill only: a reply is inserted so you can review it first.';
}

function completeOnboarding() {
  chrome.storage.sync.set({ onboardingCompleted: true }, () => showOnboarding(false));
}

function renderSiteControls(siteEnabled = {}) {
  siteListEl.querySelectorAll('.site-option').forEach((option) => option.remove());
  const normalizedSiteEnabled = normalizeSiteEnabled(siteEnabled);

  SUPPORTED_SITES.forEach((site) => {
    const option = document.createElement('div');
    option.className = 'site-option';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `site-${site.id}`;
    checkbox.dataset.site = site.id;
    checkbox.checked = normalizedSiteEnabled[site.id];

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = site.name;

    option.appendChild(checkbox);
    option.appendChild(label);
    siteListEl.appendChild(option);
  });
}

function getSiteEnabledConfig() {
  return Object.fromEntries(
    Array.from(siteListEl.querySelectorAll('input[data-site]'), (checkbox) => [checkbox.dataset.site, checkbox.checked])
  );
}

function updateSiteControlsState() {
  const disabled = !toolbarEnabledEl.checked;
  siteListEl.disabled = disabled;
  siteSettingsEl.classList.toggle('site-settings-disabled', disabled);
}

function savePreferenceSettings() {
  chrome.storage.sync.set({
    autoSend: autoSendEl.checked,
    smartQuestionDetection: smartQuestionDetectionEl.checked,
    toolbarEnabled: toolbarEnabledEl.checked,
    siteEnabled: getSiteEnabledConfig()
  }, showSaveFeedback);
}

function showSaveFeedback() {
  clearTimeout(saveToastTimer);

  if (typeof saveToastEl.showPopover === 'function') {
    if (!saveToastEl.matches(':popover-open')) saveToastEl.showPopover();
  } else {
    saveToastEl.classList.add('is-visible');
  }

  saveToastTimer = setTimeout(() => {
    if (typeof saveToastEl.hidePopover === 'function') {
      saveToastEl.hidePopover();
    } else {
      saveToastEl.classList.remove('is-visible');
    }
  }, 1400);
}

function saveQuickReplies() {
  chrome.storage.sync.set({
    activeProfile,
    profiles,
    quickReplies: profiles[activeProfile].quickReplies
  }, showSaveFeedback);
}

function queueQuickReplySave() {
  clearTimeout(replySaveTimer);
  replySaveTimer = setTimeout(saveQuickReplies, 250);
}

function render() {
  listEl.replaceChildren();
  const currentReplies = profiles[activeProfile]?.quickReplies || [];

  currentReplies.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'row';

    const createReplyInput = (className, field, value, placeholder, ariaLabel) => {
      const input = document.createElement('input');
      input.className = className;
      input.type = 'text';
      input.dataset.i = String(i);
      input.dataset.field = field;
      input.value = typeof value === 'string' ? value : '';
      input.placeholder = placeholder;
      input.setAttribute('aria-label', ariaLabel);
      return input;
    };

    const emojiInput = createReplyInput('emoji-input', 'emoji', r.emoji, 'Emoji', 'Reply emoji');
    const labelInput = createReplyInput('label-input', 'label', r.label, 'Label', 'Reply label');
    const textInput = createReplyInput('text-input', 'text', r.text, 'Prompt text or {{variable}}', 'Reply text');
    const removeButton = document.createElement('button');
    removeButton.className = 'remove';
    removeButton.dataset.i = String(i);
    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', 'Remove quick reply');
    removeButton.title = 'Remove quick reply';
    removeButton.textContent = '\u00d7';

    row.append(emojiInput, labelInput, textInput, removeButton);
    listEl.appendChild(row);
  });
}

function renderProfileOptions() {
  const profileIds = [...PROFILE_ORDER, ...Object.keys(profiles).filter((id) => !PROFILE_ORDER.includes(id))];
  profileSelectEl.replaceChildren();
  profileIds.forEach((id) => {
    const profile = profiles[id];
    if (!profile) return;
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${profile.icon || '💬'} ${profile.name || id}`;
    profileSelectEl.appendChild(option);
  });
}

function updateActiveProfileUI() {
  profileSelectEl.value = activeProfile;
}

profileSelectEl.addEventListener('change', () => {
  activeProfile = profileSelectEl.value;
  render();
  saveQuickReplies();
});

listEl.addEventListener('input', (e) => {
  const i = e.target.dataset.i;
  const field = e.target.dataset.field;
  if (i === undefined) return;
  profiles[activeProfile].quickReplies[i][field] = e.target.value;
  queueQuickReplySave();
});

listEl.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove')) {
    profiles[activeProfile].quickReplies.splice(e.target.dataset.i, 1);
    render();
    saveQuickReplies();
  }
});

addBtn.addEventListener('click', () => {
  if (!profiles[activeProfile]) return;
  profiles[activeProfile].quickReplies.push({ emoji: '💬', label: 'New', text: 'New prompt template' });
  render();
  saveQuickReplies();
});

settingsButtonEl.addEventListener('click', () => preferencesDialogEl.showModal());
closePreferencesButtonEl.addEventListener('click', () => preferencesDialogEl.close());
toolbarEnabledEl.addEventListener('change', () => {
  updateSiteControlsState();
  savePreferenceSettings();
});
autoSendEl.addEventListener('change', savePreferenceSettings);
smartQuestionDetectionEl.addEventListener('change', savePreferenceSettings);
siteListEl.addEventListener('change', savePreferenceSettings);

document.querySelectorAll('[data-demo-reply]').forEach((button) => {
  button.addEventListener('click', () => {
    demoComposerEl.textContent = button.dataset.demoReply;
  });
});

demoSendModeEl.addEventListener('change', updateDemoSendResult);
onboardingBackBtn.addEventListener('click', () => setOnboardingStep(onboardingStep - 1, true));
onboardingNextBtn.addEventListener('click', () => setOnboardingStep(onboardingStep + 1, true));
onboardingFinishBtn.addEventListener('click', completeOnboarding);
onboardingSkipBtn.addEventListener('click', completeOnboarding);
onboardingEl.addEventListener('cancel', (event) => {
  event.preventDefault();
  completeOnboarding();
});

const resetPosBtn = document.getElementById('resetPos');
if (resetPosBtn) {
  resetPosBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ resetPosition: Date.now() }, () => {
      resetPosBtn.textContent = 'Reset! ↺';
      setTimeout(() => (resetPosBtn.textContent = '↺ Reset Position'), 1200);
    });
  });
}

document.querySelectorAll('.ext-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href) chrome.tabs.create({ url: href });
  });
});

chrome.storage.sync.get(
  {
    activeProfile: 'general',
    profiles: DEFAULT_PROFILES,
    quickReplies: null,
    autoSend: false,
    smartQuestionDetection: false,
    toolbarEnabled: true,
    siteEnabled: {},
    onboardingCompleted: false
  },
  (cfg) => {
    activeProfile = cfg.activeProfile || 'general';
    profiles = cfg.profiles ? Object.assign({}, cfg.profiles) : JSON.parse(JSON.stringify(DEFAULT_PROFILES));
    for (const key of Object.keys(DEFAULT_PROFILES)) {
      if (!profiles[key]) profiles[key] = JSON.parse(JSON.stringify(DEFAULT_PROFILES[key]));
    }
    if (!profiles[activeProfile]) activeProfile = 'general';

    // Handle migration if quickReplies was customized before profiles existed
    if (cfg.quickReplies && (!cfg.profiles || !cfg.profiles.general)) {
      profiles.general.quickReplies = cfg.quickReplies;
    }

    autoSendEl.checked = cfg.autoSend;
    smartQuestionDetectionEl.checked = cfg.smartQuestionDetection === true;
    toolbarEnabledEl.checked = cfg.toolbarEnabled;
    renderSiteControls(cfg.siteEnabled);
    updateSiteControlsState();
    renderProfileOptions();
    updateActiveProfileUI();
    render();
    updateDemoSendResult();
    showOnboarding(shouldShowOnboarding(cfg.onboardingCompleted));
  }
);
