const { DEFAULT_PROFILES, PROFILE_ORDER } = globalThis.PrompticonProfilePacks;

const roleGridEl = document.getElementById('roleGrid');
const previewTitleEl = document.getElementById('previewTitle');
const previewChipsEl = document.getElementById('previewChips');
const statusMessageEl = document.getElementById('statusMessage');
const smartDetectionEl = document.getElementById('welcomeSmartDetection');
const compactEl = document.getElementById('welcomeCompact');
const defaultsEl = document.getElementById('welcomeDefaults');

let activeProfile = 'general';

function showStatus(text) {
  if (statusMessageEl) statusMessageEl.textContent = text;
}

function renderPreview(profileId) {
  const profile = DEFAULT_PROFILES[profileId] || DEFAULT_PROFILES.general;
  previewTitleEl.textContent = `${profile.icon} ${profile.name} quick replies`;
  previewChipsEl.replaceChildren();

  profile.quickReplies.forEach((reply) => {
    const chip = document.createElement('span');
    chip.className = 'preview-chip';
    chip.textContent = `${reply.emoji} ${reply.label}`;
    previewChipsEl.appendChild(chip);
  });
}

function renderRoles() {
  roleGridEl.replaceChildren();
  PROFILE_ORDER.forEach((id) => {
    const profile = DEFAULT_PROFILES[id];
    if (!profile) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'role-btn' + (id === activeProfile ? ' is-active' : '');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(id === activeProfile));
    btn.textContent = `${profile.icon} ${profile.name}`;
    btn.addEventListener('click', () => {
      activeProfile = id;
      renderRoles();
      renderPreview(id);
      if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
        chrome.storage.sync.set({
          activeProfile: id,
          quickReplies: profile.quickReplies,
          onboardingCompleted: true
        }, () => showStatus(`Selected ${profile.icon} ${profile.name} pack — ready on your AI chats!`));
      }
    });
    roleGridEl.appendChild(btn);
  });
}

function saveWelcomePreferences() {
  if (typeof chrome === 'undefined' || !chrome.storage?.sync) return;
  chrome.storage.sync.set({
    smartQuestionDetection: smartDetectionEl.checked,
    compactToolbar: compactEl.checked,
    includeDefaultReplies: defaultsEl.checked,
    onboardingCompleted: true
  }, () => showStatus('Preferences saved!'));
}

smartDetectionEl.addEventListener('change', saveWelcomePreferences);
compactEl.addEventListener('change', saveWelcomePreferences);
defaultsEl.addEventListener('change', saveWelcomePreferences);

if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
  chrome.storage.sync.get(
    {
      activeProfile: 'general',
      smartQuestionDetection: false,
      compactToolbar: false,
      includeDefaultReplies: false
    },
    (cfg) => {
      activeProfile = DEFAULT_PROFILES[cfg.activeProfile] ? cfg.activeProfile : 'general';
      smartDetectionEl.checked = cfg.smartQuestionDetection === true;
      compactEl.checked = cfg.compactToolbar === true;
      defaultsEl.checked = cfg.includeDefaultReplies === true;
      renderRoles();
      renderPreview(activeProfile);
    }
  );
} else {
  renderRoles();
  renderPreview(activeProfile);
}
