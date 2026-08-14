const DEFAULT_PROFILES = {
  general: {
    name: 'General',
    quickReplies: [
      { emoji: '👍', label: 'Yes', text: 'Yes' },
      { emoji: '👎', label: 'No', text: 'No' },
      { emoji: '➡️', label: 'Continue', text: 'Continue' },
      { emoji: '📝', label: 'More detail', text: 'Can you go into more detail?' },
      { emoji: '✂️', label: 'Shorter', text: 'Can you make that shorter?' },
      { emoji: '🙏', label: 'Thanks', text: "Thanks, that's exactly what I needed." }
    ]
  },
  quiz: {
    name: 'Quiz',
    quickReplies: [
      { emoji: '🇦', label: 'A', text: 'A' },
      { emoji: '🇧', label: 'B', text: 'B' },
      { emoji: '🇨', label: 'C', text: 'C' },
      { emoji: '🇩', label: 'D', text: 'D' },
      { emoji: '🇪', label: 'E', text: 'E' }
    ]
  }
};

const listEl = document.getElementById('list');
const addBtn = document.getElementById('add');
const saveBtn = document.getElementById('save');
const autoSendEl = document.getElementById('autoSend');
const profileTabs = document.querySelectorAll('.profile-tab');
const versionBadge = document.getElementById('versionBadge');

if (versionBadge && typeof chrome !== 'undefined' && chrome.runtime?.getManifest) {
  versionBadge.textContent = `v${chrome.runtime.getManifest().version}`;
}

let activeProfile = 'general';
let profiles = JSON.parse(JSON.stringify(DEFAULT_PROFILES));

function render() {
  listEl.innerHTML = '';
  const currentReplies = profiles[activeProfile]?.quickReplies || [];

  currentReplies.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <input class="emoji-input" type="text" data-i="${i}" data-field="emoji" value="${r.emoji}" placeholder="Emoji" />
      <input class="label-input" type="text" data-i="${i}" data-field="label" value="${r.label}" placeholder="Label" />
      <input class="text-input" type="text" data-i="${i}" data-field="text" value="${r.text}" placeholder="Prompt text" />
      <button class="remove" data-i="${i}" title="Remove">&times;</button>
    `;
    listEl.appendChild(row);
  });
}

function updateActiveTabUI() {
  profileTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.profile === activeProfile);
  });
}

profileTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activeProfile = tab.dataset.profile;
    updateActiveTabUI();
    render();
  });
});

listEl.addEventListener('input', (e) => {
  const i = e.target.dataset.i;
  const field = e.target.dataset.field;
  if (i === undefined) return;
  profiles[activeProfile].quickReplies[i][field] = e.target.value;
});

listEl.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove')) {
    profiles[activeProfile].quickReplies.splice(e.target.dataset.i, 1);
    render();
  }
});

addBtn.addEventListener('click', () => {
  if (!profiles[activeProfile]) return;
  profiles[activeProfile].quickReplies.push({ emoji: '💬', label: 'New', text: 'New prompt template' });
  render();
});

saveBtn.addEventListener('click', () => {
  chrome.storage.sync.set(
    {
      activeProfile: activeProfile,
      profiles: profiles,
      quickReplies: profiles[activeProfile].quickReplies,
      autoSend: autoSendEl.checked
    },
    () => {
      saveBtn.textContent = 'Saved Successfully! ✨';
      setTimeout(() => (saveBtn.textContent = 'Save Changes'), 1200);
    }
  );
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
    autoSend: false
  },
  (cfg) => {
    activeProfile = cfg.activeProfile || 'general';
    profiles = cfg.profiles || JSON.parse(JSON.stringify(DEFAULT_PROFILES));

    // Handle migration if quickReplies was customized before profiles existed
    if (cfg.quickReplies && (!cfg.profiles || !cfg.profiles.general)) {
      profiles.general.quickReplies = cfg.quickReplies;
    }

    autoSendEl.checked = cfg.autoSend;
    updateActiveTabUI();
    render();
  }
);
