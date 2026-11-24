const { SUPPORTED_SITES, normalizeSiteEnabled } = globalThis.PrompticonSiteSettings;
const { ONBOARDING_STEP_COUNT, getOnboardingStepState, shouldShowOnboarding } = globalThis.PrompticonOnboarding;
const { DEFAULT_PROFILES, PROFILE_ORDER } = globalThis.PrompticonProfilePacks;
const {
  TIME_SAVED_STORAGE_KEY,
  TIME_SAVED_SETTING_KEY,
  createEmptyStats,
  normalizeStats,
  formatDuration
} = globalThis.PrompticonTimeSaved;
const {
  REVIEW_PROMPT_DISMISSED_KEY,
  shouldShowReviewPrompt,
  getReviewUrl,
  buildShareText,
  renderShareCardDataUrl
} = globalThis.PrompticonShareStats;
const {
  LOCAL_PROFILES_FALLBACK_KEY,
  encodePack,
  exportPackJson,
  decodePack,
  createCustomProfileId,
  isCustomProfileId,
  buildPackShareMessage
} = globalThis.PrompticonPackSharing;

const listEl = document.getElementById('list');
const addBtn = document.getElementById('add');
const autoSendEl = document.getElementById('autoSend');
const includeDefaultRepliesEl = document.getElementById('includeDefaultReplies');
const smartQuestionDetectionEl = document.getElementById('smartQuestionDetection');
const toolbarEnabledEl = document.getElementById('toolbarEnabled');
const compactToolbarEl = document.getElementById('compactToolbar');
const toolbarFadeEnabledEl = document.getElementById('toolbarFadeEnabled');
const toolbarFadeSecondsEl = document.getElementById('toolbarFadeSeconds');
const fadeDelayRowEl = document.getElementById('fadeDelayRow');
const timeSavedTrackingEl = document.getElementById('timeSavedTracking');
const siteSettingsEl = document.getElementById('siteSettings');
const siteListEl = document.getElementById('siteList');
const timeSavedCardEl = document.getElementById('timeSavedCard');
const timeSavedValueEl = document.getElementById('timeSavedValue');
const timeSavedDetailEl = document.getElementById('timeSavedDetail');
const timeSavedActionsEl = document.getElementById('timeSavedActions');
const copyStatsBtn = document.getElementById('copyStatsBtn');
const downloadStatsCardBtn = document.getElementById('downloadStatsCardBtn');
const reviewNudgeEl = document.getElementById('reviewNudge');
const reviewNudgeCopyEl = document.getElementById('reviewNudgeCopy');
const reviewLinkEl = document.getElementById('reviewLink');
const dismissReviewBtn = document.getElementById('dismissReviewBtn');
const resetTimeSavedEl = document.getElementById('resetTimeSaved');
const openWelcomeBtn = document.getElementById('openWelcomeBtn');
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
const newPackBtn = document.getElementById('newPackBtn');
const sharePackBtn = document.getElementById('sharePackBtn');
const importPackBtn = document.getElementById('importPackBtn');
const deletePackBtn = document.getElementById('deletePackBtn');
const packDialogEl = document.getElementById('packDialog');
const packDialogTitleEl = document.getElementById('packDialogTitle');
const closePackDialogBtn = document.getElementById('closePackDialog');
const packCreateFormEl = document.getElementById('packCreateForm');
const newPackIconEl = document.getElementById('newPackIcon');
const newPackNameEl = document.getElementById('newPackName');
const packShareSectionEl = document.getElementById('packShareSection');
const packShareCodeEl = document.getElementById('packShareCode');
const copyPackCodeBtn = document.getElementById('copyPackCodeBtn');
const downloadPackJsonBtn = document.getElementById('downloadPackJsonBtn');
const packImportFormEl = document.getElementById('packImportForm');
const packImportInputEl = document.getElementById('packImportInput');
const packImportErrorEl = document.getElementById('packImportError');
const packImportFileInputEl = document.getElementById('packImportFileInput');
const loadPackFileBtn = document.getElementById('loadPackFileBtn');
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
let timeSavedStats = createEmptyStats();
let reviewPromptDismissed = false;

function formatTimeSavedDetail(stats) {
  if (stats.uses === 0) return 'No quick replies used yet.';
  const replies = `${stats.uses} quick ${stats.uses === 1 ? 'reply' : 'replies'}`;
  if (!stats.firstUsedAt) return replies;
  const since = new Date(stats.firstUsedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  return `${replies} since ${since}`;
}

function renderReviewNudge() {
  if (!reviewNudgeEl) return;
  const visible = timeSavedTrackingEl.checked && shouldShowReviewPrompt(timeSavedStats, reviewPromptDismissed);
  reviewNudgeEl.hidden = !visible;
  if (!visible) return;
  const duration = formatDuration(timeSavedStats.totalSeconds);
  reviewNudgeCopyEl.textContent = `Saved you ${duration} so far! Enjoying Prompticon?`;
}

function dismissReviewPrompt() {
  reviewPromptDismissed = true;
  if (reviewNudgeEl) reviewNudgeEl.hidden = true;
  chrome.storage.sync.set({ [REVIEW_PROMPT_DISMISSED_KEY]: true });
}

function renderTimeSavedStats(rawStats) {
  if (rawStats !== undefined) timeSavedStats = normalizeStats(rawStats);
  timeSavedCardEl.hidden = !timeSavedTrackingEl.checked;
  timeSavedValueEl.textContent = formatDuration(timeSavedStats.totalSeconds);
  timeSavedDetailEl.textContent = formatTimeSavedDetail(timeSavedStats);
  if (timeSavedActionsEl) timeSavedActionsEl.hidden = timeSavedStats.uses === 0;
  renderReviewNudge();
}

function loadTimeSavedStats() {
  chrome.storage.local.get({ [TIME_SAVED_STORAGE_KEY]: createEmptyStats() }, (result) => {
    renderTimeSavedStats(result?.[TIME_SAVED_STORAGE_KEY]);
  });
}

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

const DEFAULT_FADE_SECONDS = 3;

function getFadeSecondsValue() {
  const seconds = Number(toolbarFadeSecondsEl.value);
  if (!Number.isFinite(seconds) || seconds < 1) return DEFAULT_FADE_SECONDS;
  return Math.min(Math.round(seconds), 60);
}

function updateFadeControlsState() {
  const disabled = !toolbarEnabledEl.checked || !toolbarFadeEnabledEl.checked;
  toolbarFadeSecondsEl.disabled = disabled;
  fadeDelayRowEl.classList.toggle('site-settings-disabled', disabled);
}

function savePreferenceSettings() {
  chrome.storage.sync.set({
    autoSend: autoSendEl.checked,
    includeDefaultReplies: includeDefaultRepliesEl.checked,
    smartQuestionDetection: smartQuestionDetectionEl.checked,
    toolbarEnabled: toolbarEnabledEl.checked,
    compactToolbar: compactToolbarEl.checked,
    toolbarFadeEnabled: toolbarFadeEnabledEl.checked,
    toolbarFadeSeconds: getFadeSecondsValue(),
    [TIME_SAVED_SETTING_KEY]: timeSavedTrackingEl.checked,
    siteEnabled: getSiteEnabledConfig()
  }, showSaveFeedback);
}

function showSaveFeedback(message = 'Saved') {
  clearTimeout(saveToastTimer);
  saveToastEl.textContent = typeof message === 'string' && message ? message : 'Saved';

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

function persistQuickReplies(toastMessage = 'Saved') {
  const payload = {
    activeProfile,
    profiles,
    quickReplies: profiles[activeProfile]?.quickReplies || []
  };
  chrome.storage.sync.set(payload, () => {
    const syncError = typeof chrome !== 'undefined' ? chrome.runtime?.lastError : null;
    if (syncError && chrome.storage?.local) {
      chrome.storage.local.set({ [LOCAL_PROFILES_FALLBACK_KEY]: profiles }, () => {
        chrome.storage.sync.set({
          activeProfile,
          quickReplies: payload.quickReplies
        }, () => showSaveFeedback('Saved locally'));
      });
      return;
    }
    if (chrome.storage?.local?.remove) {
      chrome.storage.local.remove(LOCAL_PROFILES_FALLBACK_KEY);
    }
    showSaveFeedback(toastMessage);
  });
}

function saveQuickReplies() {
  persistQuickReplies('Saved');
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
  if (deletePackBtn) {
    deletePackBtn.hidden = !isCustomProfileId(activeProfile, DEFAULT_PROFILES);
  }
}

function openPackDialog(mode) {
  if (!packDialogEl) return;
  packCreateFormEl.hidden = mode !== 'create';
  packShareSectionEl.hidden = mode !== 'share';
  packImportFormEl.hidden = mode !== 'import';
  packImportErrorEl.hidden = true;
  packImportErrorEl.textContent = '';

  if (mode === 'create') {
    packDialogTitleEl.textContent = 'New custom pack';
    newPackIconEl.value = '🚀';
    newPackNameEl.value = '';
  } else if (mode === 'share') {
    const current = profiles[activeProfile];
    packDialogTitleEl.textContent = `Share ${current?.name || 'pack'}`;
    packShareCodeEl.value = encodePack(current) || '';
  } else if (mode === 'import') {
    packDialogTitleEl.textContent = 'Import prompt pack';
    packImportInputEl.value = '';
  }

  if (!packDialogEl.open) packDialogEl.showModal();
  if (mode === 'create') newPackNameEl.focus();
  else if (mode === 'share') packShareCodeEl.select();
  else if (mode === 'import') packImportInputEl.focus();
}

profileSelectEl.addEventListener('change', () => {
  activeProfile = profileSelectEl.value;
  updateActiveProfileUI();
  render();
  saveQuickReplies();
});

if (newPackBtn) newPackBtn.addEventListener('click', () => openPackDialog('create'));
if (sharePackBtn) sharePackBtn.addEventListener('click', () => openPackDialog('share'));
if (importPackBtn) importPackBtn.addEventListener('click', () => openPackDialog('import'));
if (closePackDialogBtn) closePackDialogBtn.addEventListener('click', () => packDialogEl.close());

if (deletePackBtn) {
  deletePackBtn.addEventListener('click', () => {
    if (!isCustomProfileId(activeProfile, DEFAULT_PROFILES)) return;
    delete profiles[activeProfile];
    activeProfile = 'general';
    renderProfileOptions();
    updateActiveProfileUI();
    render();
    persistQuickReplies('Pack deleted');
  });
}

if (packCreateFormEl) {
  packCreateFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = newPackNameEl.value.trim();
    if (!name) return;
    const icon = newPackIconEl.value.trim() || '🚀';
    const id = createCustomProfileId(name, profiles);
    profiles[id] = {
      icon,
      name,
      quickReplies: [{ emoji: '✨', label: 'New', text: 'Your custom prompt here' }]
    };
    activeProfile = id;
    packDialogEl.close();
    renderProfileOptions();
    updateActiveProfileUI();
    render();
    persistQuickReplies('Pack created!');
  });
}

if (copyPackCodeBtn) {
  copyPackCodeBtn.addEventListener('click', async () => {
    const shareMsg = buildPackShareMessage(profiles[activeProfile]);
    if (!shareMsg) return;
    try {
      await navigator.clipboard.writeText(shareMsg);
      showSaveFeedback('Share code copied!');
    } catch (_) {
      showSaveFeedback('Copy failed');
    }
  });
}

if (downloadPackJsonBtn) {
  downloadPackJsonBtn.addEventListener('click', () => {
    const current = profiles[activeProfile];
    const json = exportPackJson(current);
    if (!json) return;
    const slug = (current?.name || 'pack').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pack';
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompticon-${slug}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showSaveFeedback('JSON downloaded!');
  });
}

if (loadPackFileBtn && packImportFileInputEl) {
  loadPackFileBtn.addEventListener('click', () => packImportFileInputEl.click());
  packImportFileInputEl.addEventListener('change', () => {
    const file = packImportFileInputEl.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      packImportInputEl.value = typeof reader.result === 'string' ? reader.result : '';
      packImportErrorEl.hidden = true;
    };
    reader.readAsText(file);
    packImportFileInputEl.value = '';
  });
}

if (packImportFormEl) {
  packImportFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = decodePack(packImportInputEl.value);
    if (!result.ok) {
      packImportErrorEl.textContent = result.error;
      packImportErrorEl.hidden = false;
      return;
    }
    const id = createCustomProfileId(result.pack.name, profiles);
    profiles[id] = {
      icon: result.pack.icon,
      name: result.pack.name,
      quickReplies: result.pack.quickReplies
    };
    activeProfile = id;
    packDialogEl.close();
    renderProfileOptions();
    updateActiveProfileUI();
    render();
    persistQuickReplies('Pack imported!');
  });
}

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
  updateFadeControlsState();
  savePreferenceSettings();
});
compactToolbarEl.addEventListener('change', savePreferenceSettings);
toolbarFadeEnabledEl.addEventListener('change', () => {
  updateFadeControlsState();
  savePreferenceSettings();
});
toolbarFadeSecondsEl.addEventListener('change', () => {
  toolbarFadeSecondsEl.value = getFadeSecondsValue();
  savePreferenceSettings();
});
autoSendEl.addEventListener('change', savePreferenceSettings);
includeDefaultRepliesEl.addEventListener('change', savePreferenceSettings);
smartQuestionDetectionEl.addEventListener('change', savePreferenceSettings);
timeSavedTrackingEl.addEventListener('change', () => {
  renderTimeSavedStats();
  savePreferenceSettings();
});
siteListEl.addEventListener('change', savePreferenceSettings);
resetTimeSavedEl.addEventListener('click', () => {
  chrome.storage.local.set({ [TIME_SAVED_STORAGE_KEY]: createEmptyStats() }, () => {
    renderTimeSavedStats();
    showSaveFeedback();
  });
});

if (openWelcomeBtn) {
  openWelcomeBtn.addEventListener('click', () => {
    const url = typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL('welcome.html')
      : 'welcome.html';
    chrome.tabs.create({ url });
  });
}

if (copyStatsBtn) {
  copyStatsBtn.addEventListener('click', async () => {
    const summary = buildShareText(timeSavedStats, formatDuration);
    try {
      await navigator.clipboard.writeText(summary);
      showSaveFeedback('Copied!');
    } catch (_) {
      showSaveFeedback('Copy failed');
    }
  });
}

if (downloadStatsCardBtn) {
  downloadStatsCardBtn.addEventListener('click', () => {
    const dataUrl = renderShareCardDataUrl(timeSavedStats, formatDuration);
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'prompticon-time-saved.png';
    link.click();
    showSaveFeedback('Card saved!');
  });
}

if (reviewLinkEl) {
  reviewLinkEl.addEventListener('click', (e) => {
    e.preventDefault();
    const url = getReviewUrl({
      runtimeId: typeof chrome !== 'undefined' ? chrome.runtime?.id : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    });
    dismissReviewPrompt();
    chrome.tabs.create({ url });
  });
}

if (dismissReviewBtn) {
  dismissReviewBtn.addEventListener('click', dismissReviewPrompt);
}

if (chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes?.[TIME_SAVED_STORAGE_KEY]) {
      renderTimeSavedStats(changes[TIME_SAVED_STORAGE_KEY].newValue);
      return;
    }
    if (areaName === 'sync' && changes?.[TIME_SAVED_SETTING_KEY]) {
      timeSavedTrackingEl.checked = changes[TIME_SAVED_SETTING_KEY].newValue !== false;
      renderTimeSavedStats();
    }
  });
}

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
    includeDefaultReplies: false,
    smartQuestionDetection: false,
    toolbarEnabled: true,
    compactToolbar: false,
    toolbarFadeEnabled: true,
    toolbarFadeSeconds: DEFAULT_FADE_SECONDS,
    siteEnabled: {},
    onboardingCompleted: false,
    timeSavedTracking: true,
    [REVIEW_PROMPT_DISMISSED_KEY]: false
  },
  (cfg) => {
    reviewPromptDismissed = cfg[REVIEW_PROMPT_DISMISSED_KEY] === true;
    const finishInit = (localFallbackProfiles) => {
      activeProfile = cfg.activeProfile || 'general';
      const sourceProfiles = localFallbackProfiles || cfg.profiles;
      profiles = sourceProfiles ? Object.assign({}, sourceProfiles) : JSON.parse(JSON.stringify(DEFAULT_PROFILES));
      for (const key of Object.keys(DEFAULT_PROFILES)) {
        if (!profiles[key]) profiles[key] = JSON.parse(JSON.stringify(DEFAULT_PROFILES[key]));
      }
      if (!profiles[activeProfile]) activeProfile = 'general';

      // Handle migration if quickReplies was customized before profiles existed
      if (cfg.quickReplies && (!sourceProfiles || !sourceProfiles.general)) {
        profiles.general.quickReplies = cfg.quickReplies;
      }

      autoSendEl.checked = cfg.autoSend;
      includeDefaultRepliesEl.checked = cfg.includeDefaultReplies === true;
      smartQuestionDetectionEl.checked = cfg.smartQuestionDetection === true;
      toolbarEnabledEl.checked = cfg.toolbarEnabled;
      compactToolbarEl.checked = cfg.compactToolbar === true;
      toolbarFadeEnabledEl.checked = cfg.toolbarFadeEnabled !== false;
      toolbarFadeSecondsEl.value = Number.isFinite(Number(cfg.toolbarFadeSeconds)) && Number(cfg.toolbarFadeSeconds) >= 1
        ? Math.min(Math.round(Number(cfg.toolbarFadeSeconds)), 60)
        : DEFAULT_FADE_SECONDS;
      timeSavedTrackingEl.checked = cfg.timeSavedTracking !== false;
      renderSiteControls(cfg.siteEnabled);
      updateSiteControlsState();
      updateFadeControlsState();
      renderProfileOptions();
      updateActiveProfileUI();
      render();
      loadTimeSavedStats();
      updateDemoSendResult();
      showOnboarding(shouldShowOnboarding(cfg.onboardingCompleted));
    };

    if (chrome.storage?.local?.get) {
      chrome.storage.local.get({ [LOCAL_PROFILES_FALLBACK_KEY]: null }, (localRes) => {
        finishInit(localRes?.[LOCAL_PROFILES_FALLBACK_KEY] || null);
      });
    } else {
      finishInit(null);
    }
  }
);
