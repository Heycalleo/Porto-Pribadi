const root = document.documentElement;
const yearElement = document.getElementById('year');
const musicButton = document.getElementById('musicButton');
const musicInfo = document.getElementById('musicInfo');
const enterButton = document.getElementById('enterButton');
const introOverlay = document.getElementById('introOverlay');
const hero = document.querySelector('.hero');
const particleField = document.querySelector('.particle-field');
const colorPickerBtn = document.getElementById('colorPickerBtn');
const colorPicker = document.getElementById('colorPicker');
const backToTop = document.getElementById('backToTop');
const scrollProgress = document.querySelector('.scroll-progress');
const cursorGlow = document.getElementById('cursorGlow');
const particleTrailContainer = document.getElementById('particleTrail');
const floatingShapesContainer = document.getElementById('floatingShapes');
const floatingBubblesContainer = document.getElementById('floatingBubbles');
const confettiContainer = document.getElementById('confetti');
const commandPalette = document.getElementById('commandPalette');
const commandPaletteInput = document.getElementById('commandPaletteInput');
const commandPaletteList = document.getElementById('commandPaletteList');
const miniGamesLauncher = document.getElementById('miniGamesLauncher');
const miniGamesPanel = document.getElementById('miniGamesPanel');
const closeMiniGames = document.getElementById('closeMiniGames');
const miniGameTitle = document.getElementById('miniGameTitle');
const miniGameDescription = document.getElementById('miniGameDescription');
const miniGameContent = document.getElementById('miniGameContent');
const miniGameTabs = Array.from(document.querySelectorAll('.mini-game-tab'));
const moodDisplay = document.getElementById('moodDisplay');
const moodBadge = document.getElementById('moodBadge');
const moodScore = document.getElementById('moodScore');
const moodTitle = document.getElementById('moodTitle');
const moodDescription = document.getElementById('moodDescription');
const moodMeterFill = document.getElementById('moodMeterFill');
const moodTags = document.getElementById('moodTags');
const energyRange = document.getElementById('energyRange');
const chaosRange = document.getElementById('chaosRange');
const nostalgiaRange = document.getElementById('nostalgiaRange');
const energyValue = document.getElementById('energyValue');
const chaosValue = document.getElementById('chaosValue');
const nostalgiaValue = document.getElementById('nostalgiaValue');
const shuffleMood = document.getElementById('shuffleMood');
const moodPresetButtons = Array.from(document.querySelectorAll('.mood-preset'));

function getPersistedUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem('pg_users') || '{}');
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([username, record]) => [username, normalizePersistedUser(username, record)])
    );
  } catch (_) {
    return {};
  }
}

function savePersistedUsers(users) {
  try {
    localStorage.setItem('pg_users', JSON.stringify(users));
  } catch (_) {
    // ignore
  }
}

function createDefaultProfile(username = '', email = '') {
  return {
    displayName: username || 'User',
    bio: 'Suka bikin hal menarik, eksplor ide baru, dan ngulik visual yang beda.',
    avatarUrl: '',
    accent: '#7db8ff',
    joinAt: Date.now(),
    email,
  };
}

function normalizePersistedUser(username, record = {}) {
  const safeRecord = record && typeof record === 'object' ? record : {};
  const profile = safeRecord.profile && typeof safeRecord.profile === 'object'
    ? safeRecord.profile
    : createDefaultProfile(username, safeRecord.email || '');

  return {
    hash: safeRecord.hash || '',
    email: safeRecord.email || profile.email || '',
    profile: {
      ...createDefaultProfile(username, safeRecord.email || ''),
      ...profile,
      displayName: profile.displayName || username || 'User',
      email: safeRecord.email || profile.email || '',
    },
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatJoinDate(value) {
  if (!value) return 'Baru bergabung';
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (_) {
    return 'Baru bergabung';
  }
}

function getInitials(value) {
  const words = String(value || 'User').trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'U';
}

function getActiveProfileData() {
  const role = sessionStorage.getItem('userRole');
  const username = sessionStorage.getItem('username');
  const email = sessionStorage.getItem('email') || '';

  if (!role || !username) return null;
  if (role === 'guest') {
    return {
      role,
      username: 'Tamu',
      email: '',
      profile: {
        displayName: 'Mode Tamu',
        bio: 'Masuk cepat buat lihat isi website tanpa bikin akun dulu.',
        avatarUrl: '',
        accent: '#8f9bb7',
        joinAt: Date.now(),
      },
    };
  }

  if (role === 'admin') {
    return {
      role,
      username: 'admin',
      email,
      profile: {
        displayName: 'Admin Console',
        bio: 'Punya akses penuh untuk mengelola akun, tampilan, dan aktivitas situs.',
        avatarUrl: '',
        accent: '#ffb14a',
        joinAt: Date.now(),
      },
    };
  }

  const users = getPersistedUsers();
  const record = users[username];
  if (!record) return null;

  return {
    role,
    username,
    email: record.email || email,
    profile: normalizePersistedUser(username, record).profile,
  };
}

function buildProfileAvatar(profile, username) {
  if (profile?.avatarUrl) {
    return `<img src="${escapeHtml(profile.avatarUrl)}" alt="Foto profil ${escapeHtml(profile.displayName || username)}" />`;
  }
  return `<span>${escapeHtml(getInitials(profile?.displayName || username))}</span>`;
}

function getAdminResetConfig() {
  try {
    return JSON.parse(localStorage.getItem('admin_reset_config') || 'null');
  } catch (_) {
    return null;
  }
}

function getAnnouncementBanner() {
  try {
    return JSON.parse(localStorage.getItem('site_announcement_banner') || 'null');
  } catch (_) {
    return null;
  }
}

const ADMIN_ACTIVITY_LOG_KEY = 'admin_activity_log';
const ADMIN_SNAPSHOT_VERSION = 1;
const ADMIN_SNAPSHOT_KEYS = [
  'pg_users',
  'admin_reset_config',
  'site_announcement_banner',
  'accent-color',
  'admin_custom_style',
  'admin_custom_index',
];

function getAdminActivityLog() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ADMIN_ACTIVITY_LOG_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function pushAdminActivityLog(action, details, actor = null) {
  try {
    const entries = getAdminActivityLog();
    entries.unshift({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      action,
      details,
      actor: actor || sessionStorage.getItem('username') || 'system',
      createdAt: Date.now(),
    });
    localStorage.setItem(ADMIN_ACTIVITY_LOG_KEY, JSON.stringify(entries.slice(0, 40)));
  } catch (_) {
    // ignore
  }
}

function renderAnnouncementBanner() {
  const data = getAnnouncementBanner();
  const existing = document.getElementById('siteAnnouncementBanner');
  if (!data || !data.message || !String(data.message).trim()) {
    existing?.remove();
    return;
  }

  const banner = existing || document.createElement('div');
  banner.id = 'siteAnnouncementBanner';
  banner.className = 'site-announcement-banner';
  banner.innerHTML = `
    <div class="site-announcement-banner__inner">
      <span class="site-announcement-banner__label">Announcement</span>
      <p>${String(data.message)}</p>
    </div>
  `;

  if (!existing) {
    document.body.appendChild(banner);
  }
}

function forceLogoutToLogin() {
  try {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('email');
  } catch (_) {
    // ignore
  }
  location.replace('login.html');
}

function validateActiveSession() {
  const activeRole = sessionStorage.getItem('userRole');
  const activeUser = sessionStorage.getItem('username');
  if (!activeRole || activeRole === 'guest' || activeRole === 'admin') return true;
  if (!activeUser) {
    forceLogoutToLogin();
    return false;
  }
  const users = getPersistedUsers();
  if (!users[activeUser]) {
    alert('Akun ini sudah dihapus atau tidak lagi tersedia. Silakan login lagi.');
    forceLogoutToLogin();
    return false;
  }
  return true;
}

validateActiveSession();
renderAnnouncementBanner();

// detect user role and apply guest restrictions (session-based)
const storedRole = sessionStorage.getItem('userRole') || null;
const storedUser = sessionStorage.getItem('username') || null;
if (storedRole === 'guest') {
  document.body.classList.add('guest');
  // hide/disable premium visual features for guests
  if (colorPickerBtn) colorPickerBtn.style.display = 'none';
  if (particleTrailContainer) particleTrailContainer.style.display = 'none';
  if (floatingShapesContainer) floatingShapesContainer.style.display = 'none';
  if (floatingBubblesContainer) floatingBubblesContainer.style.display = 'none';
  if (confettiContainer) confettiContainer.style.display = 'none';
  // hide music button + info
  if (musicButton) musicButton.style.display = 'none';
  if (musicInfo) musicInfo.classList.add('hidden');
  // blur hobi section and hide spotify links
  const hobi = document.getElementById('hobi');
  if (hobi) {
    hobi.classList.add('blurred-section');
    const overlay = document.createElement('div');
    overlay.className = 'blur-overlay';
    overlay.innerHTML = '<div>Ingin mengetahui lebih lanjut? Silahkan login untuk membuka bagian ini.</div>';
    // ensure overlay positioned
    hobi.style.position = 'relative';
    hobi.appendChild(overlay);
  }
  const vibe = document.getElementById('vibe');
  if (vibe) {
    vibe.classList.add('blurred-section');
    const vibeOverlay = document.createElement('div');
    vibeOverlay.className = 'blur-overlay';
    vibeOverlay.innerHTML = '<div>Ingin mengetahui lebih lanjut? Silahkan login untuk membuka bagian ini.</div>';
    vibe.style.position = 'relative';
    vibe.appendChild(vibeOverlay);
  }
  document.querySelectorAll('a[href*="spotify"]').forEach(a => {
    a.classList.add('blurred-section');
    const p = document.createElement('div');
    p.className = 'blur-overlay';
    p.textContent = 'Ingin mengetahui lebih lanjut? Silahkan login.';
    a.style.position = 'relative';
    // wrap anchor to show overlay
    a.parentElement && a.parentElement.style.position === '' && (a.parentElement.style.position = 'relative');
    a.parentElement && a.parentElement.appendChild(p);
    // disable link
    a.addEventListener('click', (e) => e.preventDefault());
  });
  // show small banner if not already present
  if (!document.querySelector('.guest-banner')) {
    const b = document.createElement('div');
    b.className = 'guest-banner';
    b.textContent = 'Mode tamu: beberapa fitur dinonaktifkan. Daftar untuk akses penuh.';
    document.body.appendChild(b);
  }
}

// Floating auth bar behavior
const floatingAuth = document.getElementById('floatingAuth');
const floatingLogin = document.getElementById('floatingLogin');
const floatingSignup = document.getElementById('floatingSignup');
function updateFloatingAuth() {
  if (!floatingAuth) return;
  const role = sessionStorage.getItem('userRole');
  const authContent = document.getElementById('authContent');
  if (!authContent) return;
  if (role && role !== 'guest') {
    const account = getActiveProfileData();
    if (!account) {
      forceLogoutToLogin();
      return;
    }
    const { username, email, profile } = account;
    const accent = escapeHtml(profile.accent || '#7db8ff');
    authContent.innerHTML = `
      <div class="profile-menu" id="profileMenu">
        <button id="profileTrigger" class="user-badge user-badge-button" type="button" aria-expanded="false">
          <span class="user-badge-avatar" style="--profile-accent:${accent};">${buildProfileAvatar(profile, username)}</span>
          <span class="user-badge-meta">
            <strong class="name">${escapeHtml(profile.displayName || username || 'User')}</strong>
            <span class="user-role-label">${escapeHtml(account.role)}</span>
          </span>
        </button>
        <section id="profilePanel" class="profile-panel hidden" aria-hidden="true">
          <div class="profile-panel-head">
            <div class="profile-panel-avatar" style="--profile-accent:${accent};">${buildProfileAvatar(profile, username)}</div>
            <div>
              <p class="profile-panel-kicker">Account detail</p>
              <h3>${escapeHtml(profile.displayName || username)}</h3>
              <p class="profile-panel-username">@${escapeHtml(username)}</p>
            </div>
          </div>
          <p class="profile-panel-bio">${escapeHtml(profile.bio || 'Belum ada bio.')}</p>
          <div class="profile-panel-stats">
            <article><span>Role</span><strong>${escapeHtml(account.role)}</strong></article>
            <article><span>Email</span><strong>${escapeHtml(email || 'Belum diisi')}</strong></article>
            <article><span>Join</span><strong>${escapeHtml(formatJoinDate(profile.joinAt))}</strong></article>
          </div>
          <div class="profile-panel-actions">
            <button id="profileEditBtn" class="btn small ghost" type="button">Edit profile</button>
            <button id="floatingLogout" class="btn small" type="button">Logout</button>
          </div>
          <form id="profileEditForm" class="profile-edit-form hidden">
            <label for="profileDisplayName">Nama tampilan</label>
            <input id="profileDisplayName" name="displayName" type="text" maxlength="32" value="${escapeHtml(profile.displayName || username)}" />
            <label for="profileAvatarUrl">Link foto profil</label>
            <input id="profileAvatarUrl" name="avatarUrl" type="url" placeholder="https://contoh.com/foto.jpg" value="${escapeHtml(profile.avatarUrl || '')}" />
            <label for="profileBio">Bio singkat</label>
            <textarea id="profileBio" name="bio" rows="3" maxlength="140" placeholder="Ceritain dikit tentang akun kamu...">${escapeHtml(profile.bio || '')}</textarea>
            <label for="profileAccent">Warna profile</label>
            <input id="profileAccent" name="accent" type="color" value="${accent}" />
            <div class="profile-edit-actions">
              <button id="profileSaveBtn" class="btn small primary" type="submit">Simpan</button>
              <button id="profileCancelBtn" class="btn small ghost" type="button">Batal</button>
            </div>
          </form>
        </section>
      </div>
    `;

    const profileMenu = document.getElementById('profileMenu');
    const profileTrigger = document.getElementById('profileTrigger');
    const profilePanel = document.getElementById('profilePanel');
    const profileEditBtn = document.getElementById('profileEditBtn');
    const profileEditForm = document.getElementById('profileEditForm');
    const profileCancelBtn = document.getElementById('profileCancelBtn');
    const logoutBtn = document.getElementById('floatingLogout');
    const toggleProfilePanel = (open) => {
      if (!profilePanel || !profileTrigger || !profileMenu) return;
      profilePanel.classList.toggle('hidden', !open);
      profileMenu.classList.toggle('open', open);
      profilePanel.setAttribute('aria-hidden', String(!open));
      profileTrigger.setAttribute('aria-expanded', String(open));
    };

    profileTrigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = profileMenu?.classList.contains('open');
      toggleProfilePanel(!isOpen);
    });

    profileEditBtn?.addEventListener('click', () => {
      profileEditForm?.classList.remove('hidden');
    });

    profileCancelBtn?.addEventListener('click', () => {
      profileEditForm?.classList.add('hidden');
    });

    profileEditForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const users = getPersistedUsers();
      const currentRecord = users[username];
      if (!currentRecord) return;

      const formData = new FormData(profileEditForm);
      const nextDisplayName = String(formData.get('displayName') || '').trim() || username;
      const nextAvatarUrl = String(formData.get('avatarUrl') || '').trim();
      const nextBio = String(formData.get('bio') || '').trim() || createDefaultProfile(username).bio;
      const nextAccent = String(formData.get('accent') || '#7db8ff').trim() || '#7db8ff';

      users[username] = {
        ...currentRecord,
        profile: {
          ...normalizePersistedUser(username, currentRecord).profile,
          displayName: nextDisplayName,
          avatarUrl: nextAvatarUrl,
          bio: nextBio,
          accent: nextAccent,
        },
      };
      savePersistedUsers(users);
      updateFloatingAuth();
    });

    logoutBtn && logoutBtn.addEventListener('click', () => { sessionStorage.clear(); location.replace('login.html'); });
  } else if (role === 'guest') {
    authContent.innerHTML = `<div class="user-badge"><span class="name">Tamu</span><button id="floatingLoginGuest" class="btn small">Masuk</button></div>`;
    const l = document.getElementById('floatingLoginGuest');
    l && l.addEventListener('click', () => location.replace('login.html'));
  } else {
    authContent.innerHTML = `<button id="floatingLogin" class="btn small">Masuk</button><button id="floatingSignup" class="btn small">Daftar</button>`;
    const fl = document.getElementById('floatingLogin');
    const fs = document.getElementById('floatingSignup');
    fl && fl.addEventListener('click', () => location.href = 'login.html?tab=login');
    fs && fs.addEventListener('click', () => location.href = 'login.html?tab=signup');
  }
}
updateFloatingAuth();

document.addEventListener('click', (event) => {
  const profileMenu = document.getElementById('profileMenu');
  const profilePanel = document.getElementById('profilePanel');
  const profileTrigger = document.getElementById('profileTrigger');
  if (!profileMenu || !profilePanel || !profileTrigger) return;
  if (profileMenu.contains(event.target)) return;
  profileMenu.classList.remove('open');
  profilePanel.classList.add('hidden');
  profilePanel.setAttribute('aria-hidden', 'true');
  profileTrigger.setAttribute('aria-expanded', 'false');
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const profileMenu = document.getElementById('profileMenu');
  const profilePanel = document.getElementById('profilePanel');
  const profileTrigger = document.getElementById('profileTrigger');
  if (!profileMenu || !profilePanel || !profileTrigger) return;
  profileMenu.classList.remove('open');
  profilePanel.classList.add('hidden');
  profilePanel.setAttribute('aria-hidden', 'true');
  profileTrigger.setAttribute('aria-expanded', 'false');
});

window.addEventListener('storage', (event) => {
  if (event.key === 'pg_users') {
    validateActiveSession();
    updateFloatingAuth();
  }
  if (event.key === 'site_announcement_banner') {
    renderAnnouncementBanner();
  }
  if (storedRole === 'admin' && event.key === ADMIN_ACTIVITY_LOG_KEY) {
    const list = document.querySelector('.admin-activity-list');
    if (list) {
      list.dispatchEvent(new CustomEvent('admin-log-sync'));
    }
  }
});

// Seru Mode toggle
const seruBtn = document.getElementById('seruBtn');
let seruInterval = null;
let seruActive = false;
let seruOverlay = null;
let seruSparkInterval = null;
const moodPresets = {
  midnight: { energy: 72, chaos: 48, nostalgia: 64 },
  sunset: { energy: 58, chaos: 26, nostalgia: 82 },
  chaos: { energy: 92, chaos: 88, nostalgia: 34 },
};

function setRangeValue(input, output, value) {
  if (!input || !output) return;
  input.value = value;
  output.textContent = `${value}%`;
}

function getMoodState() {
  return {
    energy: Number(energyRange?.value || 0),
    chaos: Number(chaosRange?.value || 0),
    nostalgia: Number(nostalgiaRange?.value || 0),
  };
}

function updateMoodLab(activePreset = null) {
  if (!moodDisplay || !moodBadge || !moodScore || !moodTitle || !moodDescription || !moodMeterFill || !moodTags) return;

  const { energy, chaos, nostalgia } = getMoodState();
  if (energyValue) energyValue.textContent = `${energy}%`;
  if (chaosValue) chaosValue.textContent = `${chaos}%`;
  if (nostalgiaValue) nostalgiaValue.textContent = `${nostalgia}%`;

  const score = Math.round((energy * 0.42) + (chaos * 0.33) + (nostalgia * 0.25));
  const modeName = energy > 80
    ? (chaos > 70 ? 'Chaos performer' : 'Power focus')
    : nostalgia > 75
      ? 'Memory drift'
      : chaos < 35
        ? 'Calm explorer'
        : 'Hybrid pulse';

  const title =
    energy > 80 && chaos > 70 ? 'Neon Riot Operator' :
    nostalgia > 75 && chaos < 45 ? 'Sunset Archive Driver' :
    energy > 65 && nostalgia > 55 ? 'Midnight Signal Runner' :
    chaos > 75 ? 'Glitch Stage Wanderer' :
    'Ocean Echo Builder';

  const description =
    energy > 80 && chaos > 70
      ? 'Mode ini cocok buat malam yang liar: banyak ide, cepat gerak, dan suka bikin sesuatu yang berisik tapi keren.'
      : nostalgia > 75 && chaos < 45
        ? 'Kamu lagi ada di fase hangat dan reflektif, suka detail kecil, memori lama, dan vibe yang pelan tapi ngena.'
        : energy > 65 && nostalgia > 55
          ? 'Kombinasi fokus dan rasa. Cocok buat ngoding sambil ditemenin playlist yang bikin kepala tetap dingin.'
          : chaos > 75
            ? 'Vibe kamu lagi eksperimental. Sedikit liar, banyak tab kebuka, tapi justru sering lahir ide unik dari sini.'
            : 'Mood kamu fleksibel dan bersih. Enak buat bikin sesuatu yang rapi, estetik, dan tetap punya karakter.';

  const rgb = [
    Math.round(70 + (chaos * 1.6)),
    Math.round(95 + (nostalgia * 0.9)),
    Math.round(140 + (energy * 0.8)),
  ].join(', ');

  const tags = [
    energy > 75 ? 'high voltage' : 'steady build',
    chaos > 60 ? 'glitch energy' : 'clean flow',
    nostalgia > 60 ? 'throwback pulse' : 'future mode',
  ];

  moodBadge.textContent = activePreset ? `Preset: ${activePreset}` : `Mode: ${modeName}`;
  moodScore.textContent = `${score} / 100`;
  moodTitle.textContent = title;
  moodDescription.textContent = description;
  moodMeterFill.style.width = `${score}%`;
  moodDisplay.style.setProperty('--mood-rgb', rgb);
  moodDisplay.style.transform = 'translateY(-4px) scale(1.01)';
  window.setTimeout(() => {
    if (moodDisplay) moodDisplay.style.transform = '';
  }, 180);

  moodTags.innerHTML = tags.map((tag) => `<span>${tag}</span>`).join('');
}

function activateMoodPreset(presetKey) {
  const preset = moodPresets[presetKey];
  if (!preset) return;
  setRangeValue(energyRange, energyValue, preset.energy);
  setRangeValue(chaosRange, chaosValue, preset.chaos);
  setRangeValue(nostalgiaRange, nostalgiaValue, preset.nostalgia);
  moodPresetButtons.forEach((button) => {
    button.classList.toggle('active', button.getAttribute('data-preset') === presetKey);
  });
  updateMoodLab(presetKey);
}

function shuffleMoodLab() {
  const randomEnergy = Math.floor(Math.random() * 101);
  const randomChaos = Math.floor(Math.random() * 101);
  const randomNostalgia = Math.floor(Math.random() * 101);
  moodPresetButtons.forEach((button) => button.classList.remove('active'));
  setRangeValue(energyRange, energyValue, randomEnergy);
  setRangeValue(chaosRange, chaosValue, randomChaos);
  setRangeValue(nostalgiaRange, nostalgiaValue, randomNostalgia);
  updateMoodLab();
}
let starCatcherTimer = null;
let memoryPlaybackTimers = [];

const miniGameState = {
  activeGame: 'guess-number',
  guessTarget: Math.floor(Math.random() * 10) + 1,
  guessAttempts: 0,
  guessMessage: 'Ayo coba tebak angka rahasianya.',
  mathScore: 0,
  mathQuestion: null,
  mathMessage: 'Gas jawab, kita cek bareng.',
  starScore: 0,
  starTimeLeft: 12,
  starRunning: false,
  starMessage: 'Tekan mulai lalu buru bintangnya.',
  memorySequence: [],
  memoryInput: [],
  memoryRound: 0,
  memoryLocked: false,
  memoryMessage: 'Tekan mulai dulu buat lihat urutan pertama.'
};

function createSeruBurst() {
  if (!confettiContainer) return;
  for (let i = 0; i < 16; i += 1) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece seru';
    confetti.textContent = ['🎉', '✨', '🔥', '💥', '🌈', '🎶', '🌟'][Math.floor(Math.random() * 7)];
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = Math.random() * window.innerHeight + 'px';
    confetti.style.fontSize = (Math.random() * 26 + 18) + 'px';
    confetti.style.setProperty('--x-drift', (Math.random() - 0.5) * 320 + 'px');
    confetti.style.setProperty('--rotation', (Math.random() - 0.5) * 360 + 'deg');
    confettiContainer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3200);
  }
}

function createSeruSpark() {
  const spark = document.createElement('div');
  spark.className = 'seru-spark';
  spark.style.left = Math.random() * 100 + '%';
  spark.style.top = Math.random() * 100 + '%';
  spark.textContent = ['✨', '⚡', '🎵', '💫', '🔥'][Math.floor(Math.random() * 5)];
  document.body.appendChild(spark);
  setTimeout(() => spark.remove(), 1800);
}

function createSeruOverlay() {
  if (seruOverlay) return;
  seruOverlay = document.createElement('div');
  seruOverlay.className = 'seru-overlay';
  document.body.appendChild(seruOverlay);
}

function removeSeruOverlay() {
  if (!seruOverlay) return;
  seruOverlay.remove();
  seruOverlay = null;
}

function setMiniGamesAvailability(isEnabled) {
  if (!miniGamesLauncher) return;
  miniGamesLauncher.classList.toggle('hidden', !isEnabled);
  if (!isEnabled) {
    closeMiniGamesPanel();
  }
}

function openMiniGamesPanel() {
  if (!miniGamesPanel || !seruActive) return;
  miniGamesPanel.classList.remove('hidden');
  miniGamesPanel.setAttribute('aria-hidden', 'false');
  renderMiniGame(miniGameState.activeGame);
}

function stopStarCatcher() {
  window.clearInterval(starCatcherTimer);
  starCatcherTimer = null;
  miniGameState.starRunning = false;
}

function clearMemoryPlayback() {
  memoryPlaybackTimers.forEach((timer) => window.clearTimeout(timer));
  memoryPlaybackTimers = [];
  miniGameState.memoryLocked = false;
}

function closeMiniGamesPanel() {
  if (!miniGamesPanel) return;
  miniGamesPanel.classList.add('hidden');
  miniGamesPanel.setAttribute('aria-hidden', 'true');
  stopStarCatcher();
  clearMemoryPlayback();
}

function generateMathQuestion() {
  const a = Math.floor(Math.random() * 15) + 1;
  const b = Math.floor(Math.random() * 15) + 1;
  return {
    text: `${a} + ${b}`,
    answer: a + b
  };
}

const miniGames = {
  'guess-number': {
    title: 'Tebak Angka',
    description: 'Tebak angka dari 1 sampai 10. Setiap jawaban akan dikasih petunjuk lebih besar atau lebih kecil.',
    render: () => `
      <div class="mini-game-card">
        <div class="mini-score-row">
          <span class="mini-game-scoreboard">Target tersembunyi 1-10</span>
          <span class="mini-game-scoreboard">Percobaan: ${miniGameState.guessAttempts}</span>
        </div>
        <div class="mini-inline-form">
          <input id="guessNumberInput" type="number" min="1" max="10" placeholder="Masukkan angka 1-10" />
          <button id="guessNumberBtn" class="mini-game-action" type="button">Tebak</button>
          <button id="guessResetBtn" class="mini-game-action" type="button">Reset</button>
        </div>
        <p id="guessNumberResult" class="mini-game-result">${miniGameState.guessMessage}</p>
      </div>
    `,
    bind: () => {
      const input = document.getElementById('guessNumberInput');
      const result = document.getElementById('guessNumberResult');
      document.getElementById('guessNumberBtn')?.addEventListener('click', () => {
        const value = Number(input?.value);
        if (!value || value < 1 || value > 10) {
          miniGameState.guessMessage = 'Masukkan angka valid dari 1 sampai 10 ya.';
          result.textContent = miniGameState.guessMessage;
          return;
        }
        miniGameState.guessAttempts += 1;
        if (value === miniGameState.guessTarget) {
          miniGameState.guessMessage = `Benar! Angkanya ${value}. Keren banget.`;
          miniGameState.guessTarget = Math.floor(Math.random() * 10) + 1;
          miniGameState.guessAttempts = 0;
        } else if (value < miniGameState.guessTarget) {
          miniGameState.guessMessage = 'Masih kekecilan, naikkan lagi.';
        } else {
          miniGameState.guessMessage = 'Kebesaran, turunin sedikit.';
        }
        renderMiniGame('guess-number');
      });
      document.getElementById('guessResetBtn')?.addEventListener('click', () => {
        miniGameState.guessTarget = Math.floor(Math.random() * 10) + 1;
        miniGameState.guessAttempts = 0;
        miniGameState.guessMessage = 'Game di-reset. Coba tebak lagi.';
        renderMiniGame('guess-number');
      });
      input?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') document.getElementById('guessNumberBtn')?.click();
      });
    }
  },
  rps: {
    title: 'Suit',
    description: 'Pilih batu, gunting, atau kertas. Lihat apakah kamu bisa menang lawan komputer.',
    render: () => `
      <div class="mini-game-card">
        <div class="mini-choice-row">
          <button class="mini-choice-btn" type="button" data-rps="batu">Batu</button>
          <button class="mini-choice-btn" type="button" data-rps="gunting">Gunting</button>
          <button class="mini-choice-btn" type="button" data-rps="kertas">Kertas</button>
        </div>
        <p id="rpsResult" class="mini-game-result">Pilih dulu, nanti komputer ikut main.</p>
      </div>
    `,
    bind: () => {
      const options = ['batu', 'gunting', 'kertas'];
      document.querySelectorAll('[data-rps]').forEach((button) => {
        button.addEventListener('click', () => {
          const player = button.getAttribute('data-rps');
          const cpu = options[Math.floor(Math.random() * options.length)];
          let message = `Kamu pilih ${player}, komputer pilih ${cpu}. `;
          if (player === cpu) message += 'Seri nih.';
          else if (
            (player === 'batu' && cpu === 'gunting') ||
            (player === 'gunting' && cpu === 'kertas') ||
            (player === 'kertas' && cpu === 'batu')
          ) message += 'Kamu menang!';
          else message += 'Komputer menang kali ini.';
          const result = document.getElementById('rpsResult');
          if (result) result.textContent = message;
        });
      });
    }
  },
  math: {
    title: 'Hitung Cepat',
    description: 'Jawab soal penjumlahan secepat mungkin. Skor naik kalau jawabanmu benar.',
    render: () => {
      if (!miniGameState.mathQuestion) miniGameState.mathQuestion = generateMathQuestion();
      return `
        <div class="mini-game-card">
          <div class="mini-score-row">
            <span class="mini-game-scoreboard">Skor benar: ${miniGameState.mathScore}</span>
            <span class="mini-game-scoreboard">Soal: ${miniGameState.mathQuestion.text}</span>
          </div>
          <div class="mini-inline-form">
            <input id="mathAnswerInput" type="number" placeholder="Jawaban kamu" />
            <button id="mathAnswerBtn" class="mini-game-action" type="button">Cek</button>
            <button id="mathNextBtn" class="mini-game-action" type="button">Soal Baru</button>
          </div>
          <p id="mathResult" class="mini-game-result">${miniGameState.mathMessage}</p>
        </div>
      `;
    },
    bind: () => {
      const result = document.getElementById('mathResult');
      document.getElementById('mathAnswerBtn')?.addEventListener('click', () => {
        const answer = Number(document.getElementById('mathAnswerInput')?.value);
        if (answer === miniGameState.mathQuestion.answer) {
          miniGameState.mathScore += 1;
          miniGameState.mathMessage = 'Betul! Langsung lanjut soal berikutnya.';
          miniGameState.mathQuestion = generateMathQuestion();
          renderMiniGame('math');
        } else {
          miniGameState.mathMessage = `Belum pas, jawaban yang benar ${miniGameState.mathQuestion.answer}.`;
          result.textContent = miniGameState.mathMessage;
        }
      });
      document.getElementById('mathNextBtn')?.addEventListener('click', () => {
        miniGameState.mathQuestion = generateMathQuestion();
        miniGameState.mathMessage = 'Soal baru siap, lanjut gas.';
        renderMiniGame('math');
      });
    }
  },
  'star-catcher': {
    title: 'Tangkap Bintang',
    description: 'Klik bintang sebanyak mungkin sebelum waktu habis. Cocok buat ngetes refleks.',
    render: () => `
      <div class="mini-game-card">
        <div class="mini-score-row">
          <span class="mini-game-scoreboard">Skor: ${miniGameState.starScore}</span>
          <span class="mini-game-scoreboard">Waktu: ${miniGameState.starTimeLeft}s</span>
        </div>
        <div class="mini-inline-form">
          <button id="startStarCatcherBtn" class="mini-game-action" type="button">${miniGameState.starRunning ? 'Main Lagi' : 'Mulai Game'}</button>
        </div>
        <div id="starCatcherArea" class="star-catcher-area"></div>
        <p id="starCatcherResult" class="mini-game-result">${miniGameState.starMessage}</p>
      </div>
    `,
    bind: () => {
      const area = document.getElementById('starCatcherArea');
      const result = document.getElementById('starCatcherResult');

      function placeStar() {
        if (!area) return;
        area.innerHTML = '';
        const star = document.createElement('button');
        star.type = 'button';
        star.className = 'star-catcher-target';
        star.textContent = '⭐';
        star.style.left = `${Math.random() * 78 + 4}%`;
        star.style.top = `${Math.random() * 68 + 8}%`;
        star.addEventListener('click', () => {
          if (!miniGameState.starRunning) return;
          miniGameState.starScore += 1;
          renderMiniGame('star-catcher');
        });
        area.appendChild(star);
      }

      document.getElementById('startStarCatcherBtn')?.addEventListener('click', () => {
        stopStarCatcher();
        miniGameState.starScore = 0;
        miniGameState.starTimeLeft = 12;
        miniGameState.starRunning = true;
        miniGameState.starMessage = 'Cepat klik bintangnya!';
        renderMiniGame('star-catcher');
        starCatcherTimer = window.setInterval(() => {
          miniGameState.starTimeLeft -= 1;
          if (miniGameState.starTimeLeft <= 0) {
            stopStarCatcher();
            miniGameState.starTimeLeft = 0;
            miniGameState.starMessage = `Waktu habis! Skor akhir kamu ${miniGameState.starScore}.`;
            renderMiniGame('star-catcher');
            return;
          }
          renderMiniGame('star-catcher');
        }, 1000);
      });

      if (miniGameState.starRunning) {
        placeStar();
        if (result) result.textContent = miniGameState.starMessage;
      }
    }
  },
  'memory-lights': {
    title: 'Memory Lampu',
    description: 'Perhatikan urutan lampu menyala, lalu ulangi dengan benar. Setiap ronde urutannya makin panjang.',
    render: () => `
      <div class="mini-game-card">
        <div class="mini-score-row">
          <span class="mini-game-scoreboard">Ronde: ${miniGameState.memoryRound}</span>
          <span class="mini-game-scoreboard">Panjang urutan: ${miniGameState.memorySequence.length}</span>
        </div>
        <div class="mini-inline-form">
          <button id="memoryStartBtn" class="mini-game-action" type="button">${miniGameState.memorySequence.length ? 'Tambah Ronde' : 'Mulai Memory'}</button>
        </div>
        <div class="memory-grid">
          <button class="memory-pad" type="button" data-pad="0">Merah</button>
          <button class="memory-pad" type="button" data-pad="1">Biru</button>
          <button class="memory-pad" type="button" data-pad="2">Kuning</button>
          <button class="memory-pad" type="button" data-pad="3">Hijau</button>
        </div>
        <p id="memoryResult" class="mini-game-result">${miniGameState.memoryMessage}</p>
      </div>
    `,
    bind: () => {
      const pads = Array.from(document.querySelectorAll('.memory-pad'));
      const result = document.getElementById('memoryResult');

      function flashPad(index) {
        const pad = pads[index];
        if (!pad) return;
        pad.classList.add('is-active');
        const timer = window.setTimeout(() => pad.classList.remove('is-active'), 350);
        memoryPlaybackTimers.push(timer);
      }

      function playSequence() {
        clearMemoryPlayback();
        miniGameState.memoryLocked = true;
        miniGameState.memorySequence.forEach((value, index) => {
          const timer = window.setTimeout(() => {
            flashPad(value);
            if (index === miniGameState.memorySequence.length - 1) {
              miniGameState.memoryLocked = false;
            }
          }, index * 650 + 250);
          memoryPlaybackTimers.push(timer);
        });
      }

      document.getElementById('memoryStartBtn')?.addEventListener('click', () => {
        miniGameState.memorySequence.push(Math.floor(Math.random() * 4));
        miniGameState.memoryInput = [];
        miniGameState.memoryRound = miniGameState.memorySequence.length;
        miniGameState.memoryMessage = 'Perhatikan urutannya, habis itu ikuti ya.';
        renderMiniGame('memory-lights');
      });

      pads.forEach((pad) => {
        pad.addEventListener('click', () => {
          if (miniGameState.memoryLocked || !miniGameState.memorySequence.length) return;
          const value = Number(pad.getAttribute('data-pad'));
          flashPad(value);
          miniGameState.memoryInput.push(value);
          const currentIndex = miniGameState.memoryInput.length - 1;
          if (miniGameState.memoryInput[currentIndex] !== miniGameState.memorySequence[currentIndex]) {
            miniGameState.memorySequence = [];
            miniGameState.memoryInput = [];
            miniGameState.memoryRound = 0;
            miniGameState.memoryMessage = 'Ups, salah urutan. Mulai lagi ya.';
            if (result) result.textContent = miniGameState.memoryMessage;
            return;
          }
          if (miniGameState.memoryInput.length === miniGameState.memorySequence.length) {
            miniGameState.memoryMessage = 'Mantap, urutannya benar! Tambah ronde lagi.';
            if (result) result.textContent = miniGameState.memoryMessage;
          }
        });
      });

      if (miniGameState.memorySequence.length) {
        playSequence();
      }
    }
  }
};

function renderMiniGame(gameKey) {
  if (!miniGameContent || !miniGameTitle || !miniGameDescription) return;
  const game = miniGames[gameKey] || miniGames['guess-number'];
  miniGameState.activeGame = gameKey in miniGames ? gameKey : 'guess-number';
  miniGameTitle.textContent = game.title;
  miniGameDescription.textContent = game.description;
  miniGameContent.innerHTML = game.render();
  miniGameTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.getAttribute('data-game') === miniGameState.activeGame);
  });
  game.bind();
}

function toggleSeruMode() {
  seruActive = !seruActive;
  document.body.classList.toggle('seru-mode', seruActive);
  if (seruBtn) seruBtn.textContent = seruActive ? 'Matikan Seru Mode' : 'Seru Mode';
  const adminModeMetric = document.getElementById('metricMode');
  if (adminModeMetric) adminModeMetric.textContent = seruActive ? 'Seru' : 'Normal';
  if (seruActive) {
    createSeruOverlay();
    createSeruBurst();
    setMiniGamesAvailability(true);
    seruSparkInterval = window.setInterval(createSeruSpark, 700);
    seruInterval = window.setInterval(() => {
      createSeruBurst();
      accentIndex = (accentIndex + 1) % accentColors.length;
      updateAccent();
    }, 1300);
  } else {
    removeSeruOverlay();
    setMiniGamesAvailability(false);
    window.clearInterval(seruInterval);
    window.clearInterval(seruSparkInterval);
    seruInterval = null;
    seruSparkInterval = null;
  }
}

if (seruBtn) seruBtn.addEventListener('click', toggleSeruMode);
miniGamesLauncher?.addEventListener('click', openMiniGamesPanel);
closeMiniGames?.addEventListener('click', closeMiniGamesPanel);
miniGamesPanel?.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.getAttribute('data-close-mini-games') === 'true') {
    closeMiniGamesPanel();
  }
});
miniGameTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    stopStarCatcher();
    clearMemoryPlayback();
    renderMiniGame(tab.getAttribute('data-game') || 'guess-number');
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && miniGamesPanel && !miniGamesPanel.classList.contains('hidden')) {
    closeMiniGamesPanel();
  }
});

// Tantang button: buka tantangan.html saat diklik
const tantangBtn = document.getElementById('tantangBtn');
if (tantangBtn) {
  tantangBtn.addEventListener('click', () => { window.location.href = 'tantangan.html'; });
}

// Admin console for role 'admin'
if (storedRole === 'admin') {
  let adminConsoleAnimating = false;
  const adminToggle = document.createElement('button');
  adminToggle.className = 'admin-toggle';
  adminToggle.textContent = 'Admin';
  document.body.appendChild(adminToggle);

  const adminConsole = document.createElement('div');
  adminConsole.className = 'admin-console hidden';
  adminConsole.innerHTML = `
    <h3>Admin Console</h3>
    <div class="admin-metrics">
      <div class="admin-metric"><span>Users</span><strong id="metricUsers">0</strong></div>
      <div class="admin-metric"><span>Storage</span><strong id="metricStorage">0 KB</strong></div>
      <div class="admin-metric"><span>Theme</span><strong id="metricTheme">Default</strong></div>
      <div class="admin-metric"><span>Mode</span><strong id="metricMode">Normal</strong></div>
    </div>
    <details class="admin-section admin-collapsible" open>
      <summary>Users</summary>
      <div class="admin-section-body">
        <div class="admin-section-head">
          <strong>Kelola user</strong>
          <input id="adminUserSearch" type="text" placeholder="Cari username / email..." />
        </div>
        <ul class="admin-users"></ul>
        <div class="row">
          <button id="adminExportUsers" class="btn small">Export users</button>
          <button id="adminImportUsersBtn" class="btn small">Import users</button>
          <button id="adminClearUsers" class="btn small">Hapus semua user</button>
        </div>
        <input id="adminImportUsers" type="file" accept="application/json" class="hidden" />
      </div>
    </details>
    <details class="admin-section admin-collapsible">
      <summary>Webhook & Tools</summary>
      <div class="admin-section-body">
        <div><strong>Webhook test</strong><input id="adminWebhookUrl" placeholder="Webhook URL (optional)" /><textarea id="adminWebhookMsg" placeholder="Pesan..."></textarea><div class="row"><button id="adminSendWebhook" class="btn small">Kirim</button><button id="adminRefresh" class="btn small">Refresh</button></div></div>
        <div class="admin-section">
          <strong>Quick tools</strong>
          <div class="row">
            <button id="adminResetTheme" class="btn small">Reset theme</button>
            <button id="adminResetIntro" class="btn small">Buka intro lagi</button>
          </div>
        </div>
      </div>
    </details>
    <details class="admin-section admin-collapsible">
      <summary>Reset Password</summary>
      <div class="admin-section-body">
        <input id="adminResetCodeInput" type="text" placeholder="Masukkan kode reset aktif" />
        <div class="row">
          <button id="adminSaveResetCode" class="btn small">Simpan kode 1 jam</button>
          <button id="adminGenerateResetCode" class="btn small">Generate kode</button>
          <button id="adminClearResetCode" class="btn small">Hapus kode</button>
        </div>
        <p id="adminResetCodeStatus" class="admin-note">Belum ada kode reset aktif.</p>
        <p class="admin-note">User harus kirim "Reset password" ke nomor admin dulu, lalu hanya bisa reset pakai kode yang kamu atur di sini.</p>
      </div>
    </details>
    <details class="admin-section admin-collapsible">
      <summary>Broadcast Banner</summary>
      <div class="admin-section-body">
        <textarea id="adminAnnouncementInput" placeholder="Tulis pengumuman yang mau tampil di halaman..."></textarea>
        <div class="row">
          <button id="adminSaveAnnouncement" class="btn small">Tampilkan banner</button>
          <button id="adminClearAnnouncement" class="btn small">Hapus banner</button>
        </div>
        <p id="adminAnnouncementStatus" class="admin-note">Belum ada pengumuman aktif.</p>
      </div>
    </details>
    <details class="admin-section admin-collapsible">
      <summary>Backup & Restore</summary>
      <div class="admin-section-body">
        <p id="adminBackupStatus" class="admin-note">Snapshot mencakup users, banner, reset code, accent, dan custom editor.</p>
        <div class="row">
          <button id="adminExportSnapshot" class="btn small">Export snapshot</button>
          <button id="adminImportSnapshotBtn" class="btn small">Import snapshot</button>
        </div>
        <input id="adminImportSnapshot" type="file" accept="application/json" class="hidden" />
      </div>
    </details>
    <details class="admin-section admin-collapsible">
      <summary>Recent Activity</summary>
      <div class="admin-section-body">
        <ul class="admin-activity-list"></ul>
        <div class="row">
          <button id="adminRefreshActivity" class="btn small">Refresh log</button>
          <button id="adminClearActivity" class="btn small">Hapus log</button>
        </div>
      </div>
    </details>
    <div style="margin-top:0.6rem; display:flex; gap:0.4rem; align-items:center;"><button id="openSettingsBtn" class="btn small">Settings</button><div style="flex:1"></div><button id="adminLogout" class="btn ghost small">Logout Admin</button></div>
    <div id="settingsEditor" class="settings-editor hidden">
      <div class="settings-tabs"><button id="tabHtml" class="btn small">index.html</button><button id="tabCss" class="btn small">syle.css</button></div>
      <textarea id="settingsHtml" placeholder="index.html source..."></textarea>
      <textarea id="settingsCss" placeholder="syle.css source..." style="display:none"></textarea>
      <div class="settings-actions">
        <button id="previewBtn" class="btn small">Preview</button>
        <button id="applyCssBtn" class="btn small">Apply CSS (live)</button>
        <button id="saveSettingsBtn" class="btn small">Save to storage</button>
        <button id="downloadHtmlBtn" class="btn small">Download HTML</button>
        <button id="downloadCssBtn" class="btn small">Download CSS</button>
      </div>
    </div>
  `;
  document.body.appendChild(adminConsole);

  // Make admin console draggable by its header (h3) and persist position per-admin
  try {
    const adminUser = sessionStorage.getItem('username') || 'admin';
    const posKey = 'admin_console_pos_' + adminUser;

    // restore saved position if present
    let savedPos = null;
    try { savedPos = JSON.parse(localStorage.getItem(posKey)); } catch (_) { savedPos = null; }
    if (savedPos && typeof savedPos.left === 'number' && typeof savedPos.top === 'number') {
      const maxX = window.innerWidth - 8 - (adminConsole.offsetWidth || 360);
      const maxY = window.innerHeight - 8 - (adminConsole.offsetHeight || 200);
      const left = Math.max(8, Math.min(savedPos.left, maxX));
      const top = Math.max(8, Math.min(savedPos.top, maxY));
      adminConsole.style.left = left + 'px';
      adminConsole.style.top = top + 'px';
      adminConsole.style.right = 'auto';
    } else {
      const rect = adminConsole.getBoundingClientRect();
      adminConsole.style.left = rect.left + 'px';
      adminConsole.style.top = rect.top + 'px';
      adminConsole.style.right = 'auto';
    }

    const header = adminConsole.querySelector('h3');
    if (header) header.style.cursor = 'move';

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    header && header.addEventListener('pointerdown', (ev) => {
      isDragging = true;
      adminConsole.setPointerCapture && adminConsole.setPointerCapture(ev.pointerId);
      const r = adminConsole.getBoundingClientRect();
      dragOffsetX = ev.clientX - r.left;
      dragOffsetY = ev.clientY - r.top;
      adminConsole.classList.add('dragging');
      ev.preventDefault();
    });

    document.addEventListener('pointermove', (ev) => {
      if (!isDragging) return;
      let x = ev.clientX - dragOffsetX;
      let y = ev.clientY - dragOffsetY;
      const maxX = window.innerWidth - adminConsole.offsetWidth - 8;
      const maxY = window.innerHeight - adminConsole.offsetHeight - 8;
      x = Math.max(8, Math.min(x, maxX));
      y = Math.max(8, Math.min(y, maxY));
      adminConsole.style.left = x + 'px';
      adminConsole.style.top = y + 'px';
    });

    document.addEventListener('pointerup', (ev) => {
      if (!isDragging) return;
      isDragging = false;
      try { adminConsole.releasePointerCapture && adminConsole.releasePointerCapture(ev.pointerId); } catch (e) { }
      adminConsole.classList.remove('dragging');

      // save position
      try {
        const left = parseInt(adminConsole.style.left || '0', 10) || 0;
        const top = parseInt(adminConsole.style.top || '0', 10) || 0;
        localStorage.setItem(posKey, JSON.stringify({ left, top }));
      } catch (e) { /* ignore */ }
    });
  } catch (e) {
    // ignore if any error
  }

  function getStoredUsers() {
    return getPersistedUsers();
  }

  function buildAdminSnapshot() {
    const snapshot = {
      version: ADMIN_SNAPSHOT_VERSION,
      exportedAt: Date.now(),
      exportedBy: sessionStorage.getItem('username') || 'admin',
      data: {},
    };
    ADMIN_SNAPSHOT_KEYS.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        snapshot.data[key] = value;
      }
    });
    return snapshot;
  }

  function applyAdminSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
      throw new Error('Snapshot tidak valid.');
    }
    const data = snapshot.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Data snapshot tidak ditemukan.');
    }
    ADMIN_SNAPSHOT_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        localStorage.setItem(key, String(data[key]));
      } else {
        localStorage.removeItem(key);
      }
    });
    renderAnnouncementBanner();
    updateAdminMetrics();
    updateResetCodeStatus();
    updateAnnouncementStatus();
  }

  function estimateLocalStorageSize() {
    try {
      let bytes = 0;
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        const value = key ? localStorage.getItem(key) || '' : '';
        bytes += (key || '').length + value.length;
      }
      return `${(bytes / 1024).toFixed(bytes > 10240 ? 1 : 2)} KB`;
    } catch (_) {
      return 'unknown';
    }
  }

  function updateAdminMetrics() {
    const users = getStoredUsers();
    const userCount = Object.keys(users).length;
    const themeText = localStorage.getItem('accent-color') ? 'Custom' : 'Default';
    const modeText = seruActive ? 'Seru' : 'Normal';
    const usersEl = adminConsole.querySelector('#metricUsers');
    const storageEl = adminConsole.querySelector('#metricStorage');
    const themeEl = adminConsole.querySelector('#metricTheme');
    const modeEl = adminConsole.querySelector('#metricMode');
    if (usersEl) usersEl.textContent = String(userCount);
    if (storageEl) storageEl.textContent = estimateLocalStorageSize();
    if (themeEl) themeEl.textContent = themeText;
    if (modeEl) modeEl.textContent = modeText;
  }

  function updateResetCodeStatus() {
    const statusEl = adminConsole.querySelector('#adminResetCodeStatus');
    const inputEl = adminConsole.querySelector('#adminResetCodeInput');
    if (!statusEl || !inputEl) return;
    const config = getAdminResetConfig();
    if (!config || !config.code) {
      statusEl.textContent = 'Belum ada kode reset aktif.';
      inputEl.value = '';
      return;
    }
    const expiresAt = Number(config.expiresAt || 0);
    const expired = expiresAt < Date.now();
    const expiresText = expired
      ? 'sudah kedaluwarsa'
      : `aktif sampai ${new Date(expiresAt).toLocaleString('id-ID')}`;
    inputEl.value = String(config.code);
    statusEl.textContent = `Kode aktif: ${config.code} (${expiresText})`;
  }

  function updateAnnouncementStatus() {
    const inputEl = adminConsole.querySelector('#adminAnnouncementInput');
    const statusEl = adminConsole.querySelector('#adminAnnouncementStatus');
    if (!inputEl || !statusEl) return;
    const data = getAnnouncementBanner();
    if (!data || !data.message) {
      inputEl.value = '';
      statusEl.textContent = 'Belum ada pengumuman aktif.';
      return;
    }
    inputEl.value = String(data.message);
    const preview = String(data.message);
    statusEl.textContent = `Banner aktif: "${preview.slice(0, 72)}${preview.length > 72 ? '...' : ''}"`;
  }

  function updateBackupStatus() {
    const statusEl = adminConsole.querySelector('#adminBackupStatus');
    if (!statusEl) return;
    const snapshot = buildAdminSnapshot();
    const dataKeys = Object.keys(snapshot.data);
    statusEl.textContent = dataKeys.length
      ? `Snapshot siap diexport: ${dataKeys.length} item tersimpan.`
      : 'Belum ada data admin tersimpan untuk diexport.';
  }

  function renderAdminActivityLog() {
    const ul = adminConsole.querySelector('.admin-activity-list');
    if (!ul) return;
    ul.innerHTML = '';
    const entries = getAdminActivityLog().slice(0, 12);
    if (entries.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Belum ada aktivitas tercatat.';
      ul.appendChild(li);
      return;
    }
    entries.forEach((entry) => {
      const li = document.createElement('li');
      const meta = document.createElement('div');
      const title = document.createElement('strong');
      const stamp = document.createElement('span');
      title.textContent = `${entry.action} - ${entry.actor || 'system'}`;
      stamp.textContent = new Date(Number(entry.createdAt) || Date.now()).toLocaleString('id-ID');
      meta.appendChild(title);
      meta.appendChild(stamp);

      const detail = document.createElement('p');
      detail.textContent = entry.details || '-';

      li.appendChild(meta);
      li.appendChild(detail);
      ul.appendChild(li);
    });
  }

  function logAdminActivity(action, details) {
    pushAdminActivityLog(action, details);
    renderAdminActivityLog();
  }

  function renderAdminUsers(filterText = '') {
    const ul = adminConsole.querySelector('.admin-users');
    ul.innerHTML = '';
    const users = getStoredUsers();
    const query = filterText.trim().toLowerCase();
    const keys = Object.keys(users).filter((username) => {
      if (!query) return true;
      const email = users[username]?.email || '';
      return username.toLowerCase().includes(query) || email.toLowerCase().includes(query);
    });
    updateAdminMetrics();
    updateBackupStatus();
    if (keys.length === 0) {
      const li = document.createElement('li');
      li.textContent = query ? 'User tidak ditemukan.' : 'Tidak ada user terdaftar.';
      ul.appendChild(li);
      return;
    }
    keys.forEach((u) => {
      const li = document.createElement('li');
      const left = document.createElement('div');
      left.textContent = `${u} ${users[u].email ? '(' + users[u].email + ')' : ''}`;
      const right = document.createElement('div');
      const del = document.createElement('button');
      del.className = 'btn small';
      del.textContent = 'Hapus';
      del.addEventListener('click', () => {
        if (!confirm('Hapus user "' + u + '" ?')) return;
        delete users[u];
        localStorage.setItem('pg_users', JSON.stringify(users));
        logAdminActivity('User dihapus', `Akun "${u}" dihapus dari daftar user.`);
        renderAdminUsers();
      });
      right.appendChild(del);
      li.appendChild(left);
      li.appendChild(right);
      ul.appendChild(li);
    });
  }

  adminToggle.addEventListener('click', () => {
    if (adminConsoleAnimating) return;

    if (adminConsole.classList.contains('hidden')) {
      adminConsole.classList.remove('hidden', 'is-closing');
      adminConsole.classList.add('is-opening');
      const searchValue = adminConsole.querySelector('#adminUserSearch')?.value || '';
      renderAdminUsers(searchValue);
      updateResetCodeStatus();
      updateAnnouncementStatus();
      updateBackupStatus();
      renderAdminActivityLog();
      adminConsoleAnimating = true;
      window.setTimeout(() => {
        adminConsole.classList.remove('is-opening');
        adminConsoleAnimating = false;
      }, 420);
      return;
    }

    adminConsole.classList.remove('is-opening');
    adminConsole.classList.add('is-closing');
    adminConsoleAnimating = true;
    window.setTimeout(() => {
      adminConsole.classList.add('hidden');
      adminConsole.classList.remove('is-closing');
      adminConsoleAnimating = false;
    }, 300);
  });

  adminConsole.querySelector('#adminClearUsers').addEventListener('click', () => {
    if (!confirm('Hapus SEMUA user terdaftar? Ini irreversible.')) return;
    localStorage.removeItem('pg_users');
    logAdminActivity('Semua user dihapus', 'Admin menghapus seluruh data user terdaftar.');
    renderAdminUsers();
  });

  adminConsole.querySelector('#adminRefresh').addEventListener('click', () => {
    const searchValue = adminConsole.querySelector('#adminUserSearch')?.value || '';
    renderAdminUsers(searchValue);
  });

  adminConsole.querySelector('#adminUserSearch').addEventListener('input', (event) => {
    const target = event.target;
    renderAdminUsers(target instanceof HTMLInputElement ? target.value : '');
  });

  adminConsole.querySelector('#adminExportUsers').addEventListener('click', () => {
    const users = getStoredUsers();
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pg_users_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  adminConsole.querySelector('#adminImportUsersBtn').addEventListener('click', () => {
    adminConsole.querySelector('#adminImportUsers')?.click();
  });

  adminConsole.querySelector('#adminImportUsers').addEventListener('change', async (event) => {
    const target = event.target;
    const file = target instanceof HTMLInputElement ? target.files?.[0] : null;
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Format file tidak valid.');
      }
      const currentUsers = getStoredUsers();
      localStorage.setItem('pg_users', JSON.stringify({ ...currentUsers, ...parsed }));
      logAdminActivity('Import user', `Import user berhasil (${Object.keys(parsed).length} akun).`);
      renderAdminUsers(adminConsole.querySelector('#adminUserSearch')?.value || '');
      alert('Import user berhasil.');
    } catch (error) {
      alert('Gagal import user: ' + error.message);
    } finally {
      if (target instanceof HTMLInputElement) target.value = '';
    }
  });

  adminConsole.querySelector('#adminSendWebhook').addEventListener('click', async () => {
    const url = adminConsole.querySelector('#adminWebhookUrl').value.trim();
    const msg = adminConsole.querySelector('#adminWebhookMsg').value.trim() || 'Admin message';
    if (!url) return alert('Masukkan Webhook URL atau paste di field.');
    try {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: msg })});
      logAdminActivity('Webhook test', `Webhook test dikirim ke ${url}.`);
      alert('Terkirim');
    } catch (e) { alert('Gagal kirim: ' + e.message); }
  });

  adminConsole.querySelector('#adminResetTheme').addEventListener('click', () => {
    localStorage.removeItem('accent-color');
    localStorage.removeItem('admin_custom_style');
    const styleEl = document.getElementById('admin-custom-style');
    if (styleEl) styleEl.remove();
    root.style.removeProperty('--accent');
    logAdminActivity('Theme direset', 'Accent color dan custom CSS dihapus.');
    updateAdminMetrics();
    updateBackupStatus();
    alert('Theme di-reset ke default.');
  });

  adminConsole.querySelector('#adminResetIntro').addEventListener('click', () => {
    if (!introOverlay) return alert('Intro overlay tidak ditemukan.');
    introOverlay.style.display = '';
    introOverlay.classList.remove('intro-hidden');
    document.body.classList.add('hide-scroll');
    logAdminActivity('Intro dibuka ulang', 'Intro overlay diaktifkan ulang dari admin console.');
    alert('Intro siap dibuka lagi di halaman ini.');
  });

  adminConsole.querySelector('#adminSaveResetCode').addEventListener('click', () => {
    const inputEl = adminConsole.querySelector('#adminResetCodeInput');
    const code = inputEl?.value.trim() || '';
    if (!code) return alert('Masukkan kode reset dulu.');
    const expiresAt = Date.now() + (60 * 60 * 1000);
    localStorage.setItem('admin_reset_config', JSON.stringify({ code, expiresAt }));
    logAdminActivity('Reset code disimpan', `Kode reset aktif hingga ${new Date(expiresAt).toLocaleString('id-ID')}.`);
    updateResetCodeStatus();
    updateBackupStatus();
    alert('Kode reset disimpan dan aktif selama 1 jam.');
  });

  adminConsole.querySelector('#adminGenerateResetCode').addEventListener('click', () => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const inputEl = adminConsole.querySelector('#adminResetCodeInput');
    if (inputEl) inputEl.value = code;
  });

  adminConsole.querySelector('#adminClearResetCode').addEventListener('click', () => {
    localStorage.removeItem('admin_reset_config');
    logAdminActivity('Reset code dihapus', 'Kode reset password dihapus oleh admin.');
    updateResetCodeStatus();
    updateBackupStatus();
    alert('Kode reset dihapus.');
  });

  adminConsole.querySelector('#adminSaveAnnouncement').addEventListener('click', () => {
    const inputEl = adminConsole.querySelector('#adminAnnouncementInput');
    const message = inputEl?.value.trim() || '';
    if (!message) return alert('Tulis isi pengumuman dulu.');
    localStorage.setItem('site_announcement_banner', JSON.stringify({
      message,
      updatedAt: Date.now(),
      updatedBy: sessionStorage.getItem('username') || 'admin',
    }));
    logAdminActivity('Banner diperbarui', `Banner aktif: "${message.slice(0, 48)}${message.length > 48 ? '...' : ''}"`);
    updateAnnouncementStatus();
    updateBackupStatus();
    renderAnnouncementBanner();
    alert('Banner pengumuman ditampilkan.');
  });

  adminConsole.querySelector('#adminClearAnnouncement').addEventListener('click', () => {
    localStorage.removeItem('site_announcement_banner');
    logAdminActivity('Banner dihapus', 'Banner pengumuman dihapus dari halaman.');
    updateAnnouncementStatus();
    updateBackupStatus();
    renderAnnouncementBanner();
    alert('Banner pengumuman dihapus.');
  });

  adminConsole.querySelector('#adminExportSnapshot').addEventListener('click', () => {
    const snapshot = buildAdminSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_snapshot_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAdminActivity('Snapshot diexport', `Snapshot berisi ${Object.keys(snapshot.data).length} item berhasil diexport.`);
  });

  adminConsole.querySelector('#adminImportSnapshotBtn').addEventListener('click', () => {
    adminConsole.querySelector('#adminImportSnapshot')?.click();
  });

  adminConsole.querySelector('#adminImportSnapshot').addEventListener('change', async (event) => {
    const target = event.target;
    const file = target instanceof HTMLInputElement ? target.files?.[0] : null;
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!confirm('Import snapshot akan mengganti data admin yang tersimpan. Lanjutkan?')) return;
      applyAdminSnapshot(parsed);
      logAdminActivity('Snapshot diimport', `Snapshot dari file "${file.name}" berhasil diterapkan.`);
      renderAdminUsers(adminConsole.querySelector('#adminUserSearch')?.value || '');
      alert('Snapshot berhasil diimport.');
    } catch (error) {
      alert('Gagal import snapshot: ' + error.message);
    } finally {
      if (target instanceof HTMLInputElement) target.value = '';
    }
  });

  adminConsole.querySelector('#adminRefreshActivity').addEventListener('click', () => {
    renderAdminActivityLog();
  });

  adminConsole.querySelector('#adminClearActivity').addEventListener('click', () => {
    if (!confirm('Hapus semua recent activity?')) return;
    localStorage.removeItem(ADMIN_ACTIVITY_LOG_KEY);
    renderAdminActivityLog();
  });

  const adminActivityList = adminConsole.querySelector('.admin-activity-list');
  adminActivityList?.addEventListener('admin-log-sync', () => {
    renderAdminActivityLog();
  });

  adminConsole.querySelector('#adminLogout').addEventListener('click', () => {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('email');
    location.replace('login.html');
  });

  // Settings editor handlers
  const openSettingsBtn = adminConsole.querySelector('#openSettingsBtn');
  const settingsEditor = adminConsole.querySelector('#settingsEditor');
  const tabHtml = adminConsole.querySelector('#tabHtml');
  const tabCss = adminConsole.querySelector('#tabCss');
  const settingsHtml = adminConsole.querySelector('#settingsHtml');
  const settingsCss = adminConsole.querySelector('#settingsCss');
  const previewBtn = adminConsole.querySelector('#previewBtn');
  const applyCssBtn = adminConsole.querySelector('#applyCssBtn');
  const saveSettingsBtn = adminConsole.querySelector('#saveSettingsBtn');
  const downloadHtmlBtn = adminConsole.querySelector('#downloadHtmlBtn');
  const downloadCssBtn = adminConsole.querySelector('#downloadCssBtn');

  function showEditorTab(tab) {
    if (tab === 'html') { settingsHtml.style.display = ''; settingsCss.style.display = 'none'; }
    else { settingsHtml.style.display = 'none'; settingsCss.style.display = ''; }
  }

  openSettingsBtn.addEventListener('click', async () => {
    settingsEditor.classList.toggle('hidden');
    if (!settingsEditor.classList.contains('hidden')) {
      // load sources
      try {
        const [htmlResp, cssResp] = await Promise.all([fetch('index.html'), fetch('syle.css')]);
        const htmlText = await htmlResp.text();
        const cssText = await cssResp.text();
        const savedHtml = localStorage.getItem('admin_custom_index');
        const savedCss = localStorage.getItem('admin_custom_style');
        settingsHtml.value = savedHtml || htmlText;
        settingsCss.value = savedCss || cssText;
        showEditorTab('html');
      } catch (e) {
        settingsHtml.value = '// Tidak dapat memuat file secara langsung: ' + e.message;
      }
    }
  });

  tabHtml.addEventListener('click', () => showEditorTab('html'));
  tabCss.addEventListener('click', () => showEditorTab('css'));

  previewBtn.addEventListener('click', () => {
    // open preview in new window with edited html + css inlined
    const editedHtml = settingsHtml.value || '';
    const editedCss = settingsCss.value || '';
    const win = window.open('', '_blank');
    if (!win) return alert('Popup blocked');
    const doc = win.document;
    // inject CSS into head and write HTML
    const final = editedHtml.replace(/<head>([\s\S]*?)<\/head>/i, (m, headContent) => {
      return '<head>' + headContent + '\n<style id="admin-preview-style">' + editedCss + '</style>' + '</head>';
    });
    doc.open(); doc.write(final); doc.close();
  });

  applyCssBtn.addEventListener('click', () => {
    const css = settingsCss.value || '';
    let s = document.getElementById('admin-custom-style');
    if (!s) { s = document.createElement('style'); s.id = 'admin-custom-style'; document.head.appendChild(s); }
    s.textContent = css;
    localStorage.setItem('admin_custom_style', css);
    logAdminActivity('CSS live applied', 'Custom CSS diterapkan langsung ke halaman.');
    updateAdminMetrics();
    updateBackupStatus();
    alert('CSS diterapkan dan disimpan ke localStorage');
  });

  saveSettingsBtn.addEventListener('click', () => {
    const h = settingsHtml.value || '';
    const c = settingsCss.value || '';
    localStorage.setItem('admin_custom_index', h);
    localStorage.setItem('admin_custom_style', c);
    logAdminActivity('Settings disimpan', 'Custom HTML dan CSS disimpan ke localStorage.');
    updateAdminMetrics();
    updateBackupStatus();
    alert('Simpan selesai. Untuk melihat perubahan HTML, gunakan Preview atau muat ulang halaman jika ingin menerapkan.');
  });

  downloadHtmlBtn.addEventListener('click', () => {
    const blob = new Blob([settingsHtml.value || ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'index_custom.html'; a.click(); URL.revokeObjectURL(url);
  });

  downloadCssBtn.addEventListener('click', () => {
    const blob = new Blob([settingsCss.value || ''], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'syle_custom.css'; a.click(); URL.revokeObjectURL(url);
  });
}

const accentColors = [
  'rgba(125, 184, 255, 0.32)',
  'rgba(97, 205, 255, 0.28)',
  'rgba(220, 236, 255, 0.35)'
];
let accentIndex = 0;

function updateAccent() {
  root.style.setProperty('--dynamic-accent', accentColors[accentIndex]);
}

function applyReducedMotion(isEnabled) {
  document.body.classList.toggle('reduced-motion', Boolean(isEnabled));
  try {
    localStorage.setItem('reduced_motion', isEnabled ? '1' : '0');
  } catch (_) {
    // ignore
  }
}

function updatePointerPosition(x, y) {
  root.style.setProperty('--pointer-x', `${x}%`);
  root.style.setProperty('--pointer-y', `${y}%`);
}

function createParticles(count = 30) {
  if (!particleField) return;
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('span');
    const size = Math.random() * 6 + 3;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * -8;
    const duration = Math.random() * 12 + 8;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.top = `${top}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;

    particleField.appendChild(particle);
  }
}

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

try {
  applyReducedMotion(localStorage.getItem('reduced_motion') === '1');
} catch (_) {
  // ignore
}

if (introOverlay) {
  document.body.classList.add('hide-scroll');
}

if (enterButton && introOverlay) {
  enterButton.addEventListener('click', () => {
    introOverlay.classList.add('intro-hidden');
    document.body.classList.remove('hide-scroll');
    window.setTimeout(() => {
      introOverlay.style.display = 'none';
    }, 500);
  });
}

if (musicButton && musicInfo) {
  // Music button removed from UI; keep info visible state controlled elsewhere if needed
}

const FEEDBACK_WEBHOOK_URL = 'https://discord.com/api/webhooks/1505371926661562621/EA2Zw6Ez7PBHDWNz740aqVkpNGoienzpxXy6dPTrZSit7rNP4wTh_9u3qk_IfSQdCMLE';
const feedbackForm = document.getElementById('feedbackForm');
const feedbackStatus = document.getElementById('feedbackStatus');

async function getPublicIp() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

async function sendFeedback(payload) {
  if (!FEEDBACK_WEBHOOK_URL) {
    throw new Error('Webhook URL belum diset.');
  }

  const response = await fetch(FEEDBACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Gagal mengirim feedback.');
  }
}

if (feedbackForm && feedbackStatus) {
  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nameEl = document.getElementById('feedbackName');
    const name = nameEl ? nameEl.value.trim() : '';
    const message = document.getElementById('feedbackMessage').value.trim();

    if (!name) {
      feedbackStatus.textContent = 'Nama wajib diisi.';
      feedbackStatus.classList.remove('success');
      feedbackStatus.classList.add('error');
      nameEl && nameEl.focus();
      return;
    }

    if (!message) {
      feedbackStatus.textContent = 'Tolong tulis pesan feedback sebelum kirim.';
      feedbackStatus.classList.remove('success');
      feedbackStatus.classList.add('error');
      return;
    }

    feedbackStatus.textContent = 'Mengirim feedback...';
    feedbackStatus.classList.remove('success', 'error');

    try {
      const ip = await getPublicIp();
      const payload = {
        name,
        message,
        ip,
        content: `Feedback dari: ${name}\nIP publik: ${ip}\nPesan:\n${message}`,
      };

      await sendFeedback(payload);
      feedbackStatus.textContent = 'Feedback berhasil dikirim. Terima kasih!';
      feedbackStatus.classList.add('success');
      feedbackForm.reset();
    } catch (error) {
      feedbackStatus.textContent = `Error: ${error.message}`;
      feedbackStatus.classList.add('error');
    }
  });
}

if (hero) {
  createParticles(35);

  const handlePointer = (event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;
    updatePointerPosition(x, y);
  };

  const handlePointerDown = () => {
    accentIndex = (accentIndex + 1) % accentColors.length;
    updateAccent();
    hero.classList.add('hero-active');
    window.setTimeout(() => hero.classList.remove('hero-active'), 200);
  };

  document.addEventListener('pointermove', handlePointer);
  document.addEventListener('pointerdown', handlePointerDown);
}

updateAccent();

if (colorPickerBtn && colorPicker) {
  colorPickerBtn.addEventListener('click', () => {
    colorPicker.classList.toggle('hidden');
  });

  document.querySelectorAll('.color-option').forEach((option) => {
    const color = option.getAttribute('data-color');
    option.style.backgroundColor = color;
    
    option.addEventListener('click', () => {
      root.style.setProperty('--accent', color);
      localStorage.setItem('accent-color', color);
      colorPicker.classList.add('hidden');
      const adminThemeMetric = document.getElementById('metricTheme');
      if (adminThemeMetric) adminThemeMetric.textContent = 'Custom';
    });
  });

  const savedColor = localStorage.getItem('accent-color');
  if (savedColor) {
    root.style.setProperty('--accent', savedColor);
    const adminThemeMetric = document.getElementById('metricTheme');
    if (adminThemeMetric) adminThemeMetric.textContent = 'Custom';
  }
}

[energyRange, chaosRange, nostalgiaRange].forEach((input) => {
  input?.addEventListener('input', () => {
    moodPresetButtons.forEach((button) => button.classList.remove('active'));
    updateMoodLab();
  });
});

moodPresetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activateMoodPreset(button.getAttribute('data-preset') || 'midnight');
  });
});

shuffleMood?.addEventListener('click', shuffleMoodLab);

if (moodDisplay) {
  activateMoodPreset('midnight');
}

if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.remove('hidden');
    } else {
      backToTop.classList.add('hidden');
    }

    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (scrollProgress) {
      scrollProgress.style.width = scrollPercent + '%';
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Cursor Glow Effect
if (cursorGlow) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });
}

// Particle Trail Effect
if (particleTrailContainer) {
  document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.8) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 6 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = e.clientX + 'px';
      particle.style.top = e.clientY + 'px';
      particle.style.background = getComputedStyle(root).getPropertyValue('--accent');
      particle.style.setProperty('--tx', (Math.random() - 0.5) * 100 + 'px');
      particle.style.setProperty('--ty', (Math.random() - 0.5) * 100 + 'px');
      particleTrailContainer.appendChild(particle);
      setTimeout(() => particle.remove(), 1500);
    }
  });
}

// Floating Shapes
if (floatingShapesContainer) {
  const shapeTypes = ['circle', 'square', 'triangle'];
  for (let i = 0; i < 5; i++) {
    const shape = document.createElement('div');
    shape.className = 'shape ' + shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    shape.style.width = (Math.random() * 80 + 40) + 'px';
    shape.style.height = (Math.random() * 80 + 40) + 'px';
    shape.style.left = Math.random() * 100 + '%';
    shape.style.top = Math.random() * 100 + '%';
    shape.style.animationDuration = (Math.random() * 10 + 15) + 's';
    shape.style.animationDelay = Math.random() * 5 + 's';
    floatingShapesContainer.appendChild(shape);
  }
}

// Floating Bubbles
if (floatingBubblesContainer) {
  for (let i = 0; i < 8; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = Math.random() * 100 + 50;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * 100 + '%';
    bubble.style.bottom = '-100px';
    bubble.style.setProperty('--duration', (Math.random() * 20 + 15) + 's');
    bubble.style.setProperty('--drift', (Math.random() - 0.5) * 200 + 'px');
    floatingBubblesContainer.appendChild(bubble);
  }
}

// Confetti on Click
if (confettiContainer) {
  document.addEventListener('click', (e) => {
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.textContent = ['🎉', '✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 5)];
      confetti.style.left = e.clientX + 'px';
      confetti.style.top = e.clientY + 'px';
      confetti.style.fontSize = (Math.random() * 20 + 16) + 'px';
      confetti.style.setProperty('--x-drift', (Math.random() - 0.5) * 200 + 'px');
      confettiContainer.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }
  });
}

// 3D Tilt Card Effect
document.querySelectorAll('.card').forEach((card) => {
  if (!card.classList.contains('tilt-card')) {
    card.classList.add('tilt-card');
  }
  
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
  });
});

// Scroll Reveal Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal', 'revealed');
    }
  });
}, observerOptions);

document.querySelectorAll('.card, article').forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Keyboard Shortcuts (ignore when typing in form fields)
document.addEventListener('keydown', (e) => {
  const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
  const isTyping = ['input', 'textarea', 'select'].includes(tag) || (e.target && e.target.isContentEditable);
  if (isTyping) return; // don't trigger shortcuts while typing

  const shortcuts = {
    't': 'tentang',
    'h': 'hobi',
    'm': 'musik',
    'f': 'favorit',
    'b': 'feedback',
    'k': 'kontak'
  };
  
  const key = (e.key || '').toLowerCase();
  if (shortcuts[key]) {
    const section = document.getElementById(shortcuts[key]);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }
});

// Command Palette (Ctrl+K or /)
if (commandPalette && commandPaletteInput && commandPaletteList) {
  const paletteState = {
    commands: [],
    filtered: [],
    activeIndex: 0,
    isOpen: false,
    lastFocus: null
  };

  const baseCommands = [
    {
      title: 'Toggle Reduced Motion',
      subtitle: 'Kurangi animasi kalau pusing / hemat baterai',
      keywords: ['motion', 'reduce', 'animasi', 'hemat', 'battery', 'pusing'],
      run: () => applyReducedMotion(!document.body.classList.contains('reduced-motion')),
      kbd: 'Alt+R'
    },
    {
      title: 'Cycle Accent Glow',
      subtitle: 'Ganti warna glow/accent pelan-pelan',
      keywords: ['accent', 'warna', 'glow', 'tema', 'color'],
      run: () => {
        accentIndex = (accentIndex + 1) % accentColors.length;
        updateAccent();
      },
      kbd: 'Alt+A'
    },
    {
      title: 'Jump to Feedback',
      subtitle: 'Langsung ke form feedback',
      keywords: ['feedback', 'pesan', 'kritik', 'saran', 'form'],
      run: () => document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' }),
      kbd: 'Alt+F'
    }
  ];

  function buildSectionCommands() {
    const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
    const uniqueIds = new Set();
    const sectionCommands = [];

    anchors.forEach((anchor) => {
      const raw = anchor.getAttribute('href');
      const id = raw ? raw.slice(1) : '';
      if (!id || uniqueIds.has(id)) return;
      const target = document.getElementById(id);
      if (!target) return;
      uniqueIds.add(id);
      const title = anchor.textContent?.trim() || id;
      sectionCommands.push({
        title: `Go to: ${title}`,
        subtitle: `Scroll ke bagian #${id}`,
        keywords: [title, id, 'go', 'scroll', 'bagian', 'section'],
        run: () => target.scrollIntoView({ behavior: 'smooth' })
      });
    });

    return sectionCommands;
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function getCommandScore(command, query) {
    if (!query) return 1;
    const haystack = normalizeText([command.title, command.subtitle, ...(command.keywords || [])].join(' '));
    const parts = normalizeText(query).split(/\s+/).filter(Boolean);
    let score = 0;
    for (const part of parts) {
      if (haystack.includes(part)) score += 2;
      else return 0;
    }
    return score;
  }

  function renderList() {
    commandPaletteList.innerHTML = '';
    paletteState.filtered.forEach((command, index) => {
      const item = document.createElement('li');
      item.className = 'command-palette__item' + (index === paletteState.activeIndex ? ' is-active' : '');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', index === paletteState.activeIndex ? 'true' : 'false');

      const left = document.createElement('div');
      const title = document.createElement('div');
      title.className = 'command-palette__item-title';
      title.textContent = command.title;
      const subtitle = document.createElement('div');
      subtitle.className = 'command-palette__item-subtitle';
      subtitle.textContent = command.subtitle || '';
      left.appendChild(title);
      if (command.subtitle) left.appendChild(subtitle);

      const right = document.createElement('div');
      right.className = 'command-palette__item-kbd';
      if (command.kbd) right.textContent = command.kbd;

      item.appendChild(left);
      item.appendChild(right);

      item.addEventListener('click', () => {
        paletteState.activeIndex = index;
        runActiveCommand();
      });

      commandPaletteList.appendChild(item);
    });
  }

  function filterCommands(query) {
    const scored = paletteState.commands
      .map((command) => ({ command, score: getCommandScore(command, query) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score);
    paletteState.filtered = scored.map((row) => row.command);
    paletteState.activeIndex = 0;
    renderList();
  }

  function openPalette() {
    if (paletteState.isOpen) return;
    paletteState.isOpen = true;
    paletteState.lastFocus = document.activeElement;
    commandPalette.classList.remove('hidden');
    commandPaletteInput.value = '';
    paletteState.commands = [...baseCommands, ...buildSectionCommands()];
    filterCommands('');
    window.setTimeout(() => commandPaletteInput.focus(), 0);
  }

  function closePalette() {
    if (!paletteState.isOpen) return;
    paletteState.isOpen = false;
    commandPalette.classList.add('hidden');
    if (paletteState.lastFocus && typeof paletteState.lastFocus.focus === 'function') {
      paletteState.lastFocus.focus();
    }
  }

  function runActiveCommand() {
    const cmd = paletteState.filtered[paletteState.activeIndex];
    if (!cmd) return;
    closePalette();
    try {
      cmd.run();
    } catch (_) {
      // ignore
    }
  }

  commandPalette.addEventListener('click', (event) => {
    const target = event.target;
    if (target && target.getAttribute && target.getAttribute('data-close') === 'true') {
      closePalette();
    }
  });

  commandPaletteInput.addEventListener('input', () => {
    filterCommands(commandPaletteInput.value);
  });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey && event.key.toLowerCase() === 'k') || (!event.ctrlKey && event.key === '/')) {
      const tag = (document.activeElement && document.activeElement.tagName) ? document.activeElement.tagName.toLowerCase() : '';
      const isTyping = ['input', 'textarea', 'select'].includes(tag);
      if (!isTyping) {
        event.preventDefault();
        openPalette();
      }
    }

    if (!paletteState.isOpen) {
      if (event.altKey && event.key.toLowerCase() === 'r') applyReducedMotion(!document.body.classList.contains('reduced-motion'));
      if (event.altKey && event.key.toLowerCase() === 'a') {
        accentIndex = (accentIndex + 1) % accentColors.length;
        updateAccent();
      }
      if (event.altKey && event.key.toLowerCase() === 'f') document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      paletteState.activeIndex = Math.min(paletteState.activeIndex + 1, paletteState.filtered.length - 1);
      renderList();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      paletteState.activeIndex = Math.max(paletteState.activeIndex - 1, 0);
      renderList();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      runActiveCommand();
    }
  });
}
